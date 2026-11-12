"""
Circuit Blueprint Analysis API — FastAPI ML Microservice
=========================================================
Serves as the Python ML backend for the Java Spring Boot orchestrator.

Endpoints
---------
GET  /health   — Health and model status. Matches Java MlHealthDto contract.
POST /analyze  — Accepts a PDF, PNG, JPG or JPEG file from Java (multipart).
               Returns a JSON response matching Java MlInferenceResultDto.

Java DTO contract (MlInferenceResultDto):
    documentId    : String
    modelName     : String
    detectionCount: Integer
    ocrCount      : Integer
    detections    : List<Map<String, Object>>
    ocrBlocks     : List<Map<String, Object>>
    rawJson       : String

Java sends multipart fields:
    file         — the uploaded document binary
    document_id  — the Java UUID string for this document
"""

from __future__ import annotations

import asyncio
import json
import math
import os
import random
import tempfile
import time
import traceback
import urllib.request
from contextlib import asynccontextmanager, suppress
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool

from vision_engine.app.document_pipeline import (
    DEFAULT_MODEL,
    detect_components_with_model,
    pdf_to_images,
)
from vision_engine.app.ocr_engine import extract_text, tesseract_available

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "vision_engine" / "outputs" / "api_analysis"
MAX_UPLOAD_BYTES = 50 * 1024 * 1024  # 50 MB — matches Java Spring Boot limit

MODEL_NAME = "circuit_yolov8n_preliminary"
MODEL_VERSION = "0.1.0-preliminary"

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}
PDF_MAGIC = b"%PDF-"
PNG_MAGIC = b"\x89PNG"
JPEG_MAGIC = b"\xff\xd8\xff"

# ---------------------------------------------------------------------------
# Model state — loaded once at startup (Phase 2.4)
# ---------------------------------------------------------------------------
_yolo_model = None   # Set by lifespan; never mutated during request handling


# ---------------------------------------------------------------------------
# Self-polling keep-alive configuration (3 minutes = 180 seconds)
# ---------------------------------------------------------------------------
SELF_PING_ENABLED = os.environ.get("SELF_PING_ENABLED", "true").lower() == "true"
SELF_PING_INTERVAL_SECONDS = int(os.environ.get("SELF_PING_INTERVAL_SECONDS", "180"))


def _run_random_calculation() -> float:
    """Perform a lightweight random math calculation to keep runtime active without RAM spikes."""
    seed = random.uniform(1.0, 100.0)
    acc = seed
    for i in range(1, 501):
        acc = (acc * 1.00013 + math.sin(seed + i)) % 10000.0
    return round(acc, 4)


def _ping_url_sync(url: str) -> tuple[int, str]:
    """Synchronously send an HTTP GET request using stdlib (zero extra dependencies)."""
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "ml-service-keepalive/1.0"},
        method="GET",
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        body = resp.read(256).decode("utf-8", errors="replace")
        return resp.status, body


async def _self_polling_loop() -> None:
    """Background task that pings self (and optional backend URL) every 3 minutes."""
    await asyncio.sleep(30)  # Wait for Uvicorn to bind port after startup

    port = os.environ.get("PORT", "8000")
    self_base = (
        os.environ.get("SELF_PING_URL")
        or os.environ.get("RENDER_EXTERNAL_URL")
        or f"http://127.0.0.1:{port}"
    ).rstrip("/")
    backend_base = os.environ.get("BACKEND_URL", "").strip().rstrip("/")

    while True:
        calc_value = _run_random_calculation()
        targets = [("ml-self", f"{self_base}/keepalive")]
        if backend_base:
            targets.append(("backend", f"{backend_base}/api/keepalive"))

        for name, target_url in targets:
            try:
                status_code, _ = await asyncio.to_thread(_ping_url_sync, target_url)
                print(
                    f"[keepalive] {name} ({target_url}) -> HTTP {status_code} "
                    f"| calc={calc_value}"
                )
            except Exception as exc:
                print(
                    f"[keepalive] WARNING — ping failed for {name} ({target_url}): {exc} "
                    f"| calc={calc_value}"
                )

        await asyncio.sleep(SELF_PING_INTERVAL_SECONDS)


# ---------------------------------------------------------------------------
# Application lifespan — preload YOLO model on startup
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(application: FastAPI):
    """Load the YOLO model once on startup and release on shutdown."""
    global _yolo_model

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    if DEFAULT_MODEL.is_file():
        try:
            from ultralytics import YOLO as _YOLO  # noqa: N811
            _yolo_model = _YOLO(str(DEFAULT_MODEL))
            print(
                f"[startup] YOLO model loaded: {DEFAULT_MODEL.name} "
                f"({DEFAULT_MODEL.stat().st_size // 1024} KB)"
            )
        except Exception as exc:
            print(f"[startup] WARNING — YOLO model failed to load: {exc}")
            _yolo_model = None
    else:
        print(f"[startup] WARNING — YOLO model not found at: {DEFAULT_MODEL}")
        _yolo_model = None

    tess_ok = tesseract_available()
    print(f"[startup] Tesseract OCR available: {tess_ok}")
    if not tess_ok:
        tess_cmd = os.environ.get("TESSERACT_CMD", "")
        hint = f" (TESSERACT_CMD={tess_cmd!r})" if tess_cmd else ""
        print(f"[startup] OCR will be skipped. Install Tesseract or set TESSERACT_CMD.{hint}")

    keepalive_task = None
    if SELF_PING_ENABLED:
        keepalive_task = asyncio.create_task(_self_polling_loop())
        print(f"[startup] Self-polling keep-alive enabled (interval={SELF_PING_INTERVAL_SECONDS}s).")

    yield  # Application runs

    if keepalive_task is not None:
        keepalive_task.cancel()
        with suppress(asyncio.CancelledError):
            await keepalive_task

    _yolo_model = None
    print("[shutdown] YOLO model released.")


# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Circuit Blueprint Analysis API",
    version="1.0.0",
    description=(
        "Python ML microservice for multimodal circuit/blueprint analysis. "
        "Provides YOLO component detection and Tesseract OCR extraction. "
        "Designed to be called exclusively by the Java Spring Boot backend."
    ),
    lifespan=lifespan,
)


# ---------------------------------------------------------------------------
# Phase 2.5 — /health endpoint matching Java MlHealthDto
# Java MlHealthDto fields: status, modelName, version
# ---------------------------------------------------------------------------
@app.get("/health")
def health():
    """Health check. Returns Java-compatible MlHealthDto structure.

    Java MlHealthDto expects: {status, modelName, version}
    This endpoint includes extra diagnostic fields (service, model_loaded,
    tesseract_available) but retains the required Java fields.
    """
    model_loaded = _yolo_model is not None
    tess_ok = tesseract_available()

    # Determine overall status
    if model_loaded:
        status = "ok"
    else:
        status = "degraded"

    return {
        # Java MlHealthDto required fields
        "status": status,
        "modelName": MODEL_NAME if model_loaded else None,
        "version": MODEL_VERSION,
        # Extended diagnostics (ignored by Java but useful for debugging)
        "service": "circuit-blueprint-analysis",
        "modelLoaded": model_loaded,
        "modelFile": str(DEFAULT_MODEL.name) if model_loaded else None,
        "tesseractAvailable": tess_ok,
    }


@app.get("/keepalive")
def keepalive():
    """Lightweight keep-alive endpoint that runs a small random calculation."""
    return {
        "status": "alive",
        "service": "circuit-blueprint-analysis",
        "modelLoaded": _yolo_model is not None,
        "timestamp": time.time(),
        "calculationResult": _run_random_calculation(),
    }


# ---------------------------------------------------------------------------
# Phase 2.2 + 2.3 — /analyze endpoint
# Accepts: PDF, PNG, JPG, JPEG
# Returns: Java MlInferenceResultDto-compatible JSON
# ---------------------------------------------------------------------------
@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    document_id: str = Form(default=""),
):
    """Analyse a blueprint or circuit document.

    Accepts PDF (multi-page) or image (PNG/JPG/JPEG) files.
    Returns a JSON body that matches Java MlInferenceResultDto:
        documentId, modelName, detectionCount, ocrCount,
        detections[], ocrBlocks[], rawJson
    """
    # ------------------------------------------------------------------
    # 1. Validate filename / extension
    # ------------------------------------------------------------------
    filename = Path(file.filename or "upload").name
    suffix = Path(filename).suffix.lower()

    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported file type '{suffix}'. "
                f"Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}."
            ),
        )

    # ------------------------------------------------------------------
    # 2. Read content with size limit
    # ------------------------------------------------------------------
    content = await file.read(MAX_UPLOAD_BYTES + 1)
    await file.close()

    if not content:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds the {MAX_UPLOAD_BYTES // (1024 * 1024)} MB upload limit.",
        )

    # ------------------------------------------------------------------
    # 3. Validate file magic bytes (content-based, not extension-based)
    # ------------------------------------------------------------------
    is_pdf = content.startswith(PDF_MAGIC)
    is_png = content.startswith(PNG_MAGIC)
    is_jpeg = content.startswith(JPEG_MAGIC)

    if suffix == ".pdf" and not is_pdf:
        raise HTTPException(status_code=400, detail="File has .pdf extension but does not appear to be a valid PDF.")
    if suffix == ".png" and not is_png:
        raise HTTPException(status_code=400, detail="File has .png extension but does not appear to be a valid PNG.")
    if suffix in {".jpg", ".jpeg"} and not is_jpeg:
        raise HTTPException(status_code=400, detail="File has JPEG extension but does not appear to be a valid JPEG.")

    # ------------------------------------------------------------------
    # 4. Check YOLO model availability
    # ------------------------------------------------------------------
    if _yolo_model is None:
        raise HTTPException(
            status_code=503,
            detail=(
                f"YOLO model is not loaded. "
                f"Expected weights at: {DEFAULT_MODEL}. "
                "Check startup logs for details."
            ),
        )

    # ------------------------------------------------------------------
    # 5. Run analysis in thread pool (CPU-bound work)
    # ------------------------------------------------------------------
    try:
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

        result = await run_in_threadpool(
            _analyse_document,
            content,
            filename,
            suffix,
            document_id,
        )
        return result

    except HTTPException:
        raise
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Document analysis failed: {type(exc).__name__}: {exc}",
        ) from exc


# ---------------------------------------------------------------------------
# Internal analysis logic (runs in threadpool — must be synchronous)
# ---------------------------------------------------------------------------
def _analyse_document(
    content: bytes,
    filename: str,
    suffix: str,
    document_id: str,
) -> dict:
    """Synchronous analysis pipeline.

    Returns a dict matching Java MlInferenceResultDto:
        documentId, modelName, detectionCount, ocrCount,
        detections, ocrBlocks, rawJson
    """
    all_detections: list[dict] = []
    all_ocr_blocks: list[dict] = []

    with tempfile.TemporaryDirectory(prefix="blueprint_analysis_") as tmp:
        tmp_path = Path(tmp)
        file_path = tmp_path / filename
        file_path.write_bytes(content)

        job_dir = tmp_path / "job"
        job_dir.mkdir()

        if suffix == ".pdf":
            # PDF — render each page, then run OCR + YOLO per page
            image_paths = pdf_to_images(file_path, job_dir / "pages", dpi=200)
        else:
            # Standalone image — treat as a single-page document
            image_paths = [str(file_path)]

        for page_number, image_path in enumerate(image_paths, start=1):
            # YOLO detection
            detections = detect_components_with_model(
                image_path,
                _yolo_model,
                confidence=0.25,
            )
            for det in detections:
                det["pageNumber"] = page_number
            all_detections.extend(detections)

            # OCR extraction
            try:
                raw_text = extract_text(image_path)
            except Exception as ocr_exc:
                raw_text = ""
                print(f"[analyze] OCR failed on page {page_number}: {ocr_exc}")

            if raw_text:
                all_ocr_blocks.append({
                    "text": raw_text,
                    "pageNumber": page_number,
                })

    # Build the full raw result for storage in analysis_records.raw_response_json
    raw_result = {
        "filename": filename,
        "documentId": document_id,
        "pageCount": len(image_paths),
        "detections": all_detections,
        "ocrBlocks": all_ocr_blocks,
    }

    # Return Java MlInferenceResultDto-compatible structure
    return {
        "documentId": document_id,
        "modelName": MODEL_NAME,
        "detectionCount": len(all_detections),
        "ocrCount": len(all_ocr_blocks),
        "detections": all_detections,
        "ocrBlocks": all_ocr_blocks,
        "rawJson": json.dumps(raw_result, ensure_ascii=False),
    }


# ---------------------------------------------------------------------------
# Dev entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
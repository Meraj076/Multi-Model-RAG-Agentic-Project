"""
Phase 2.8 End-to-End Test Suite
Tests against the live Python FastAPI ML service on port 8000.
"""
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

BASE = "http://localhost:8000"
SAMPLE_JPG = Path(r"C:\RAG Final project\Developer_Handover\sample_results\pcb_dataset1_ArduinoMega_Top_jpg.rf.8cce8ea9ce48355be8cd580ed67cc161.jpg")

PASS = 0
FAIL = 0


def report(test_num, name, passed, detail=""):
    global PASS, FAIL
    status = "PASS" if passed else "FAIL"
    if passed:
        PASS += 1
    else:
        FAIL += 1
    print(f"Test {test_num:02d} [{status}] {name}")
    if detail:
        for line in detail.strip().splitlines():
            print(f"         {line}")


# ------------------------------------------------------------------
# Test 1: Health endpoint — Java MlHealthDto compatible fields
# ------------------------------------------------------------------
try:
    resp = urllib.request.urlopen(f"{BASE}/health")
    data = json.loads(resp.read())
    has_status = "status" in data
    has_model_name = "modelName" in data
    has_version = "version" in data
    model_ok = data.get("modelLoaded") is True
    tess_ok = data.get("tesseractAvailable")
    passed = has_status and has_model_name and has_version and model_ok
    detail = (
        f"status={data.get('status')}, modelName={data.get('modelName')}, "
        f"version={data.get('version')}, modelLoaded={data.get('modelLoaded')}, "
        f"tesseractAvailable={tess_ok}"
    )
    report(1, "Health endpoint — Java MlHealthDto fields present", passed, detail)
except Exception as e:
    report(1, "Health endpoint", False, str(e))


# ------------------------------------------------------------------
# Test 9: Reject unsupported extension
# ------------------------------------------------------------------
try:
    boundary = "boundary_t9"
    body = f"--{boundary}\r\n".encode()
    body += b'Content-Disposition: form-data; name="file"; filename="report.docx"\r\n'
    body += b"Content-Type: application/octet-stream\r\n\r\n"
    body += b"not a valid file\r\n"
    body += f"--{boundary}--\r\n".encode()
    req = urllib.request.Request(f"{BASE}/analyze", data=body, method="POST")
    req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
    urllib.request.urlopen(req)
    report(9, "Reject unsupported file type .docx", False, "Expected HTTP 400 but got 200")
except urllib.error.HTTPError as e:
    passed = e.code == 400
    detail = json.loads(e.read()).get("detail", "")
    report(9, "Reject unsupported file type .docx", passed, f"HTTP {e.code}: {detail}")


# ------------------------------------------------------------------
# Test 3 + 6: Upload JPG image — YOLO detections
# ------------------------------------------------------------------
def post_file(filepath, doc_id="test-doc-001"):
    filepath = Path(filepath)
    ext = filepath.suffix.lower()
    mime_map = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".pdf": "application/pdf"}
    mime = mime_map.get(ext, "application/octet-stream")
    content = filepath.read_bytes()
    boundary = "boundary_analyze"
    body = f"--{boundary}\r\n".encode()
    body += f'Content-Disposition: form-data; name="file"; filename="{filepath.name}"\r\n'.encode()
    body += f"Content-Type: {mime}\r\n\r\n".encode()
    body += content + b"\r\n"
    body += f"--{boundary}\r\n".encode()
    body += b'Content-Disposition: form-data; name="document_id"\r\n\r\n'
    body += doc_id.encode() + b"\r\n"
    body += f"--{boundary}--\r\n".encode()
    req = urllib.request.Request(f"{BASE}/analyze", data=body, method="POST")
    req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
    resp = urllib.request.urlopen(req, timeout=120)
    return json.loads(resp.read())


try:
    data = post_file(SAMPLE_JPG, "test-jpg-001")
    # Verify Java DTO fields
    fields_ok = all(k in data for k in ["documentId", "modelName", "detectionCount", "ocrCount", "detections", "ocrBlocks", "rawJson"])
    doc_id_ok = data.get("documentId") == "test-jpg-001"
    model_ok = data.get("modelName") == "circuit_yolov8n_preliminary"
    det_count = data.get("detectionCount", 0)
    ocr_count = data.get("ocrCount", 0)
    raw_json_ok = isinstance(data.get("rawJson"), str) and len(data.get("rawJson", "")) > 10

    passed = fields_ok and doc_id_ok and model_ok and raw_json_ok
    detail = (
        f"documentId={data.get('documentId')}, modelName={data.get('modelName')}, "
        f"detectionCount={det_count}, ocrCount={ocr_count}, "
        f"rawJson len={len(data.get('rawJson',''))}, "
        f"all_dto_fields={fields_ok}"
    )
    report(3, "JPG image analysis — Java DTO contract satisfied", passed, detail)

    # Test 6: Verify detections structure
    detections = data.get("detections", [])
    if detections:
        det = detections[0]
        det_ok = all(k in det for k in ["class_id", "class_name", "confidence", "bbox_xyxy", "pageNumber"])
        bbox = det.get("bbox_xyxy", [])
        bbox_ok = len(bbox) == 4 and all(isinstance(v, float) for v in bbox)
        conf_ok = 0.0 <= det.get("confidence", -1) <= 1.0
        passed6 = det_ok and bbox_ok and conf_ok
        detail6 = (
            f"First detection: class_id={det.get('class_id')}, "
            f"class_name={det.get('class_name')}, "
            f"confidence={det.get('confidence')}, "
            f"bbox={bbox}, page={det.get('pageNumber')}"
        )
        report(6, "YOLO detection structure (class_id, bbox_xyxy, confidence)", passed6, detail6)
    else:
        report(6, "YOLO detection structure", None, f"No detections returned (det_count={det_count}) — model may not detect on this image at conf=0.25")

    # Test 5: OCR results
    ocr_blocks = data.get("ocrBlocks", [])
    if ocr_blocks:
        ocr_ok = all("text" in b and "pageNumber" in b for b in ocr_blocks)
        sample_text = ocr_blocks[0].get("text", "")[:80]
        report(5, "OCR extraction — text present", ocr_ok, f"ocrCount={ocr_count}, sample: {repr(sample_text)}")
    else:
        report(5, "OCR extraction", None, f"No OCR text extracted (ocrCount={ocr_count})")

except Exception as e:
    import traceback
    report(3, "JPG image analysis", False, traceback.format_exc())
    report(5, "OCR extraction", False, "Skipped due to Test 3 failure")
    report(6, "YOLO detection structure", False, "Skipped due to Test 3 failure")


# ------------------------------------------------------------------
# Test 2: Create a minimal valid PDF and test PDF analysis
# ------------------------------------------------------------------
try:
    # Minimal valid PDF with one white page
    minimal_pdf = (
        b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
        b"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
        b"3 0 obj<</Type/Page/MediaBox[0 0 100 100]/Parent 2 0 R>>endobj\n"
        b"xref\n0 4\n0000000000 65535 f\r\n0000000009 00000 n\r\n"
        b"0000000058 00000 n\r\n0000000115 00000 n\r\n"
        b"trailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF"
    )
    boundary = "boundary_pdf"
    body = f"--{boundary}\r\n".encode()
    body += b'Content-Disposition: form-data; name="file"; filename="test_circuit.pdf"\r\n'
    body += b"Content-Type: application/pdf\r\n\r\n"
    body += minimal_pdf + b"\r\n"
    body += f"--{boundary}\r\n".encode()
    body += b'Content-Disposition: form-data; name="document_id"\r\n\r\ntest-pdf-001\r\n'
    body += f"--{boundary}--\r\n".encode()
    req = urllib.request.Request(f"{BASE}/analyze", data=body, method="POST")
    req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
    resp = urllib.request.urlopen(req, timeout=60)
    data = json.loads(resp.read())

    fields_ok = all(k in data for k in ["documentId", "modelName", "detectionCount", "ocrCount", "detections", "ocrBlocks", "rawJson"])
    doc_id_ok = data.get("documentId") == "test-pdf-001"
    passed = fields_ok and doc_id_ok
    detail = f"documentId={data.get('documentId')}, detectionCount={data.get('detectionCount')}, ocrCount={data.get('ocrCount')}, all_fields={fields_ok}"
    report(2, "PDF analysis — Java DTO contract satisfied", passed, detail)
except Exception as e:
    report(2, "PDF analysis", False, str(e))


# ------------------------------------------------------------------
# Test (magic byte validation): Fake PDF with wrong magic bytes
# ------------------------------------------------------------------
try:
    boundary = "boundary_fakepdf"
    body = f"--{boundary}\r\n".encode()
    body += b'Content-Disposition: form-data; name="file"; filename="fake.pdf"\r\n'
    body += b"Content-Type: application/pdf\r\n\r\n"
    body += b"this is NOT a PDF\r\n"
    body += f"--{boundary}--\r\n".encode()
    req = urllib.request.Request(f"{BASE}/analyze", data=body, method="POST")
    req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
    urllib.request.urlopen(req, timeout=30)
    report(9, "Reject fake PDF with wrong magic bytes", False, "Expected HTTP 400 but got 200")
except urllib.error.HTTPError as e:
    passed = e.code == 400
    detail = json.loads(e.read()).get("detail", "")
    report(9, "Reject fake PDF with wrong magic bytes (magic byte validation)", passed, f"HTTP {e.code}: {detail}")


# ------------------------------------------------------------------
# Summary
# ------------------------------------------------------------------
total = PASS + FAIL
print(f"\n{'='*60}")
print(f"RESULTS: {PASS}/{total} tests passed, {FAIL}/{total} failed")
print(f"{'='*60}")
sys.exit(0 if FAIL == 0 else 1)
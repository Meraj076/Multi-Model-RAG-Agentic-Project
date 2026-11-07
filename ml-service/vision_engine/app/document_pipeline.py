from pathlib import Path
import pymupdf
from PIL import Image
from ultralytics import YOLO

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MODEL = ROOT / "models" / "circuit_yolov8n_preliminary.pt"


def pdf_to_images(pdf_path, output_dir, dpi=200):
    """Convert each PDF page into a PNG image.

    Parameters
    ----------
    pdf_path : str or Path
    output_dir : str or Path
        Directory where page images will be saved.
    dpi : int
        Render resolution. Default 200 matches analyzer.py caller.

    Returns
    -------
    list[str]
        Absolute paths to the saved PNG images, in page order.
    """
    pdf_path = Path(pdf_path).resolve()
    output_dir = Path(output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    images = []
    with pymupdf.open(pdf_path) as document:
        for page_index, page in enumerate(document):
            pix = page.get_pixmap(dpi=dpi, alpha=False)
            image_path = output_dir / f"page_{page_index + 1}.png"
            pix.save(str(image_path))
            images.append(str(image_path))

    return images


def detect_components(image_path, model_path=DEFAULT_MODEL, confidence=0.25):
    """Run YOLO inference on one image, loading the model from disk each call.

    Prefer detect_components_with_model() when a preloaded YOLO instance is
    available (e.g. when called from the FastAPI service) to avoid the per-
    request model-loading overhead.
    """
    model_path = Path(model_path)
    if not model_path.is_file():
        raise FileNotFoundError(f"YOLO weights not found: {model_path}")

    with Image.open(image_path) as img:
        img.verify()

    model = YOLO(str(model_path))
    return _run_inference(model, image_path, confidence)


def detect_components_with_model(image_path, model, confidence=0.25):
    """Run YOLO inference using a caller-supplied, pre-loaded YOLO model.

    Parameters
    ----------
    image_path : str or Path
        Path to the image to analyse.
    model : ultralytics.YOLO
        A YOLO model instance already loaded into memory.
    confidence : float
        Minimum confidence threshold.

    Returns
    -------
    list[dict]
        Each dict: {class_id, class_name, confidence, bbox_xyxy}
    """
    with Image.open(image_path) as img:
        img.verify()

    return _run_inference(model, image_path, confidence)


def _run_inference(model, image_path, confidence=0.25):
    """Shared YOLO inference logic."""
    results = model.predict(
        source=str(image_path),
        conf=confidence,
        imgsz=320,
        device="cpu",
        verbose=False,
    )

    detections = []
    for result in results:
        for box in result.boxes:
            class_id = int(box.cls.item())
            detections.append({
                "class_id": class_id,
                "class_name": model.names.get(class_id, str(class_id)),
                "confidence": round(float(box.conf.item()), 4),
                "bbox_xyxy": [round(float(v), 2) for v in box.xyxy[0].tolist()],
            })

    return detections
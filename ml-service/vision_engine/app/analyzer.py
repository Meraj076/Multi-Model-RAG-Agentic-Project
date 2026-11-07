from pathlib import Path
from vision_engine.app.document_pipeline import (
    pdf_to_images,
    detect_components,
)
from vision_engine.app.ocr_engine import extract_text


def analyze_pdf(pdf_path, output_dir, confidence=0.25):
    """Convert a circuit PDF, extract text, and detect components."""
    pdf_path = Path(pdf_path).resolve()
    output_dir = Path(output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    page_dir = output_dir / "pages"
    images = pdf_to_images(pdf_path, page_dir, dpi=200)

    report = {
        "pdf": str(pdf_path),
        "page_count": len(images),
        "pages": [],
    }

    for page_number, image_path in enumerate(images, start=1):
        text = extract_text(image_path)
        detections = detect_components(
            image_path, confidence=confidence
        )

        report["pages"].append({
            "page_number": page_number,
            "image_path": image_path,
            "extracted_text": text,
            "component_count": len(detections),
            "components": detections,
        })

    return report

"""OCR engine using Tesseract via pytesseract.

Tesseract executable path is resolved from the environment variable
TESSERACT_CMD, falling back to the standard Windows installation path.
Set TESSERACT_CMD to override on any machine or OS.

Example:
    $env:TESSERACT_CMD = "C:\\custom\\path\\tesseract.exe"
"""
import os
from pathlib import Path

import pytesseract
from PIL import Image

# ------------------------------------------------------------------
# Tesseract executable resolution — configurable, not hardcoded
# ------------------------------------------------------------------
_TESSERACT_ENV = os.environ.get("TESSERACT_CMD", "").strip()

if _TESSERACT_ENV:
    # Explicit override from environment variable
    pytesseract.pytesseract.tesseract_cmd = _TESSERACT_ENV
else:
    # Default Windows installation path
    _WIN_DEFAULT = Path(r"C:\Program Files\Tesseract-OCR\tesseract.exe")
    if _WIN_DEFAULT.exists():
        pytesseract.pytesseract.tesseract_cmd = str(_WIN_DEFAULT)
    # On Linux/macOS 'tesseract' is typically on PATH — no override needed.


def tesseract_available() -> bool:
    """Return True if Tesseract can be called successfully."""
    try:
        pytesseract.get_tesseract_version()
        return True
    except Exception:
        return False


def extract_text(image_path: str | Path) -> str:
    """Extract text from an image using Tesseract OCR.

    Parameters
    ----------
    image_path : str or Path
        Path to an image file (PNG, JPG, etc.).

    Returns
    -------
    str
        Extracted text, stripped of leading/trailing whitespace.
        Returns an empty string if Tesseract is unavailable rather than
        raising, so that YOLO detection can still succeed.

    Raises
    ------
    FileNotFoundError
        If the image file does not exist.
    """
    image_path = Path(image_path)

    if not image_path.is_file():
        raise FileNotFoundError(f"Image not found: {image_path}")

    if not tesseract_available():
        # Warn but do not crash — callers check ocr_count separately.
        import warnings
        warnings.warn(
            "Tesseract is not available. OCR extraction skipped. "
            "Install Tesseract or set the TESSERACT_CMD environment variable.",
            RuntimeWarning,
            stacklevel=2,
        )
        return ""

    with Image.open(image_path) as image:
        text = pytesseract.image_to_string(image, config="--psm 11")

    return text.strip()
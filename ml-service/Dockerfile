# ============================================================
# Dockerfile — Circuit Blueprint Analysis ML Microservice
# Python 3.11 + FastAPI + YOLOv8 + Tesseract OCR
# ============================================================

FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Install system dependencies (Tesseract OCR, English model, GL / image libraries)
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-eng \
    libtesseract-dev \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install CPU-only PyTorch first to keep image size small
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Install application dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code and models
COPY main.py .
COPY vision_engine/ ./vision_engine/

# Verify Tesseract is reachable on PATH
RUN which tesseract && tesseract --version

EXPOSE 8000

# Run uvicorn on the container PORT (provided by Render or defaulting to 8000)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1"]


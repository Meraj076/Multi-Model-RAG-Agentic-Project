# Multimodal Agentic RAG for Complex Blueprint & Circuit Analysis

A production-grade, end-to-end multimodal AI platform for electronic circuit blueprint analysis, component detection (YOLOv8), text extraction (Tesseract OCR), and document management.

---

## 1. System Architecture

The project is structured as a **Microservices Monorepo**:

```mermaid
flowchart TD
    User["Client Browser"] -->|HTTP / HTTPS| Frontend["React 18 + Vite Frontend\n(Vercel SPA)"]
    Frontend -->|REST API\n(VITE_API_BASE_URL)| Backend["Java Spring Boot 3.3.5 Backend\n(Render Web Service)"]
    Backend -->|JDBC\n(SPRING_DATASOURCE_URL)| Database[("PostgreSQL 16+\n(Render / Supabase / Neon)")]
    Backend -->|Multipart Form POST\n(ML_SERVICE_URL)| MLService["Python FastAPI ML Microservice\n(Render Docker Web Service)"]
    MLService -->|Inference| YOLO["YOLOv8 Circuit Detector\n(circuit_yolov8n_preliminary.pt)"]
    MLService -->|Text Extraction| Tesseract["Tesseract OCR Engine\n(pytesseract)"]
```

---

## 2. Monorepo Directory Structure

```
Multi-Model-RAG-Agentic-Project/
├── .gitignore                          # Comprehensive monorepo exclusion rules
├── README.md                           # Master project documentation
│
├── frontend/                           # React 18 + Vite 6 + Tailwind CSS Frontend
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json                     # Client-side routing rewrite for Vercel
│   ├── .env.example                    # VITE_API_BASE_URL=...
│   └── src/
│       ├── api/                        # Axios client & REST endpoints
│       ├── components/                 # Upload dropzone, bounding box overlay, tables
│       ├── pages/                      # Dashboard, Documents, Details, Health
│       └── lib/                        # Constants & class mappings
│
├── backend/                            # Java 21 Spring Boot 3.3.5 Backend Orchestrator
│   ├── pom.xml
│   ├── Dockerfile                      # Multi-stage Eclipse Temurin 21 build
│   ├── src/main/java/com/blueprint/rag/
│   │   ├── client/                     # RestClient abstraction to Python service
│   │   ├── config/                     # CORS, RestClient timeouts, Storage config
│   │   ├── controller/                 # /api/documents, /api/health
│   │   ├── dto/                        # Request/Response contracts & envelopes
│   │   ├── entity/                     # JPA entities (blueprint_documents, analysis_records)
│   │   ├── repository/                 # Spring Data JPA repositories
│   │   └── service/                    # Business logic & file storage
│   ├── src/main/resources/
│   │   └── application.properties      # Cloud-ready properties (env vars)
│   └── data/                           # Local uploads storage (.gitkeep)
│
└── ml-service/                         # Python 3.11 FastAPI ML Microservice
    ├── main.py                         # FastAPI application entry point (/analyze, /health)
    ├── requirements.txt                # Python dependencies (headless OpenCV, PyTorch CPU, Tesseract)
    ├── Dockerfile                      # Linux container with Tesseract OCR & OpenCV libs
    ├── configs/
    │   └── config.yaml                 # Detection thresholds & model parameters
    ├── tests/
    │   └── test_phase2_e2e.py          # End-to-end integration test suite
    └── vision_engine/                  # Vision pipeline package
        ├── app/
        │   ├── analyzer.py             # PDF orchestrator
        │   ├── document_pipeline.py    # PyMuPDF rendering & YOLOv8 inference
        │   └── ocr_engine.py           # Tesseract OCR engine with fallback
        └── models/
            ├── circuit_yolov8n_preliminary.pt  # 6.16 MB trained 14-class YOLOv8 weights
            └── yolov8n.pt              # Baseline model
```

---

## 3. Local Development Setup

### Prerequisites
- **Java**: OpenJDK 21 LTS
- **Node.js**: v18+ (v20+ recommended)
- **Python**: 3.10 to 3.12 (with Tesseract-OCR installed)
- **Database**: PostgreSQL 15+ running locally on port `5432`

---

### Step 1: Start PostgreSQL
Create a database named `blueprint_db`:
```sql
CREATE DATABASE blueprint_db;
```

---

### Step 2: Run the Python ML Microservice
```powershell
cd ml-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt

# Start FastAPI server on port 8000
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Test health: `http://localhost:8000/health`

---

### Step 3: Run the Java Spring Boot Backend
```powershell
cd backend
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/blueprint_db"
$env:SPRING_DATASOURCE_USERNAME="postgres"
$env:SPRING_DATASOURCE_PASSWORD="your_postgres_password"
$env:ML_SERVICE_URL="http://localhost:8000"

mvn spring-boot:run
```
Backend starts on `http://localhost:8080`.
Test health: `http://localhost:8080/api/health` (verifies backend + ML service connection).

---

### Step 4: Run the React Frontend
```powershell
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 4. Production Cloud Deployment Guide

### Deployment Architecture
- **Source Code**: GitHub (`Meraj076/Multi-Model-RAG-Agentic-Project`)
- **Database**: Render Managed PostgreSQL (or Supabase / Neon)
- **ML Service**: Render Web Service (Docker)
- **Backend**: Render Web Service (Docker / Native Maven)
- **Frontend**: Vercel (Vite Preset)

---

### Phase 1: Deploy PostgreSQL Database
1. Go to [Render Dashboard](https://dashboard.render.com/) -> **New +** -> **PostgreSQL Database**.
2. Settings:
   - Name: `blueprint-db`
   - Database: `blueprint_db`
   - User: `blueprint_user`
   - Plan: **Free**
3. Once provisioned, copy the **External Database URL** and prepare the JDBC string:
   ```
   jdbc:postgresql://<host>.oregon-postgres.render.com:5432/blueprint_db?sslmode=require
   ```

---

### Phase 2: Deploy Python ML Service (Render)
1. In Render Dashboard, click **New +** -> **Web Service**.
2. Connect GitHub repo: `Meraj076/Multi-Model-RAG-Agentic-Project`.
3. Configure:
   - **Name**: `blueprint-ml-service`
   - **Root Directory**: `ml-service`
   - **Runtime**: **Docker** (automatically builds from `ml-service/Dockerfile`)
   - **Instance Type**: Free
4. Environment Variables:
   - `PORT`: `8000`
5. Click **Deploy Web Service**.
6. Note the deployed URL: `https://blueprint-ml-service.onrender.com`.

---

### Phase 3: Deploy Java Spring Boot Backend (Render)
1. In Render Dashboard, click **New +** -> **Web Service**.
2. Connect GitHub repo: `Meraj076/Multi-Model-RAG-Agentic-Project`.
3. Configure:
   - **Name**: `blueprint-backend-service`
   - **Root Directory**: `backend`
   - **Runtime**: **Docker** (automatically builds from `backend/Dockerfile`)
   - **Instance Type**: Free
4. Environment Variables:
   - `PORT`: `8080`
   - `SPRING_DATASOURCE_URL`: `jdbc:postgresql://<host>:5432/blueprint_db?sslmode=require`
   - `SPRING_DATASOURCE_USERNAME`: `<your_db_username>`
   - `SPRING_DATASOURCE_PASSWORD`: `<your_db_password>`
   - `ML_SERVICE_URL`: `https://blueprint-ml-service.onrender.com`
   - `ML_SERVICE_CONNECT_TIMEOUT_MS`: `60000`
   - `ML_SERVICE_READ_TIMEOUT_MS`: `90000`
   - `JAVA_OPTS`: `-Xms192m -Xmx320m -XX:+UseSerialGC`
5. Click **Deploy Web Service**.
6. Verify at: `https://blueprint-backend-service.onrender.com/api/health`.

---

### Phase 4: Deploy React Frontend (Vercel)
1. Log in to [Vercel](https://vercel.com/) and click **Add New Project**.
2. Import `Meraj076/Multi-Model-RAG-Agentic-Project`.
3. Project Configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Environment Variables:
   - `VITE_API_BASE_URL`: `https://blueprint-backend-service.onrender.com/api`
5. Click **Deploy**.
6. Your live web app is now available at: `https://<your-project>.vercel.app`.

---

## 5. API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System health check (reports JVM status & Python ML connectivity). |
| `POST` | `/api/documents/upload` | Multipart file upload (`.pdf`, `.png`, `.jpg`, `.jpeg` up to 50 MB). |
| `GET` | `/api/documents` | Lists all uploaded blueprint documents with status & metadata. |
| `GET` | `/api/documents/{id}` | Retrieves metadata and status for a specific document. |
| `POST` | `/api/documents/{id}/analyze` | Triggers YOLO component detection & Tesseract OCR analysis. |
| `GET` | `/api/documents/{id}/download` | Downloads the raw uploaded blueprint file. |
| `GET` | `/api/documents/{id}/records` | Retrieves past ML analysis records for a document. |
| `DELETE`| `/api/documents/{id}` | Deletes document metadata and removes the local file. |

---

## 6. Detectable Circuit Component Classes

The custom YOLOv8 model (`circuit_yolov8n_preliminary.pt`) detects 14 standard circuit component classes:

| Class ID | Component Name | Class ID | Component Name |
| :---: | :--- | :---: | :--- |
| 0 | Resistor | 7 | Ground |
| 1 | Capacitor | 8 | Connector |
| 2 | Diode | 9 | Fuse |
| 3 | LED | 10 | IC |
| 4 | Transistor | 11 | Inductor |
| 5 | Switch | 12 | Transformer |
| 6 | Battery | 13 | Bridge Rectifier |

---

## 7. License

This project is licensed under the Apache 2.0 License.

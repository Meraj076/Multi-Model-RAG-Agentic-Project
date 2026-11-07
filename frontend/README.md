# Multimodal Agentic RAG for Complex Blueprint & Circuit Analysis
## Production-Style Frontend Engineering Dashboard

Production-grade frontend dashboard designed for multimodal engineering blueprint and circuit diagram analysis. The frontend integrates with an existing **Java Spring Boot Orchestrator** on port `8080`, which coordinates with a **Python FastAPI Vision Engine** on port `8000` (PyMuPDF, Tesseract OCR, and Ultralytics YOLOv8).

---

## 1. Quick Start (Windows PowerShell)

Ensure Node.js (v18+) is installed on your machine.

```powershell
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Build for production (TypeScript check + Vite bundle)
npm run build
```

- **Frontend Application URL**: [http://localhost:5173](http://localhost:5173)
- **Java Spring Boot API Base URL**: `http://localhost:8080/api`
- **Python FastAPI Service Target**: `http://127.0.0.1:8000`

---

## 2. Technology Stack & Architectural Decisions

- **Framework**: [React 18](https://react.dev/) (Pure JavaScript / JSX)
- **Bundler & Tooling**: [Vite](https://vitejs.dev/) with hot module replacement (HMR)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/) with dark mode, custom glassmorphism, and responsive breakpoints
- **Icons**: [Lucide React](https://lucide.dev/) (consistent engineering icons)
- **Routing**: [React Router DOM v7](https://reactrouter.com/) (declarative multi-page navigation)
- **API Client**: [Axios](https://axios-http.com/) with centralized envelope unwrapping (`ApiResponse`) and defensive error normalization

---

## 3. System Architecture & Data Flow

```text
┌─────────────────────────┐          ┌─────────────────────────┐          ┌─────────────────────────┐
│     Browser Client      │  HTTP    │    Java Spring Boot     │  HTTP    │   Python FastAPI Engine │
│  (React 18 + Vite :5173)│ ───────> │  (Orchestrator :8080)   │ ───────> │    (YOLO + OCR :8000)   │
└─────────────────────────┘          └─────────────────────────┘          └─────────────────────────┘
        ▲                                     ▲                                        ▲
        │                                     │                                        │
    Calls Java Only                    File Storage (data/uploads)               PyMuPDF Rasterizer
    Enforces contract                  H2/SQLite Database                        Tesseract OCR Engine
    Safe JSON viewer                   Spring WebClient to Python                YOLOv8 Component Model
```

> **Strict Security & Contract Rule**: The browser communicates **exclusively** with Java Spring Boot at `http://localhost:8080`. It never calls Python directly.

---

## 4. Environment Configuration

Create a `.env` file in the project root (copied from `.env.example`):

```bash
# Java Spring Boot Backend Base URL
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 5. Java API Endpoints & Field Mappings

| Endpoint | HTTP Method | Java DTO / Payload | Frontend Display & Functionality |
| :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | `HealthResponse` | Displays Java backend status (`UP`/`DOWN`), JVM version, storage path, and Python ML connectivity. |
| `/api/documents/upload` | `POST` | `multipart/form-data` (`file`) | Drag-and-drop file upload (PDF, PNG, JPG) up to 50MB. Renders returned document UUID and toast. |
| `/api/documents` | `GET` | `ApiResponse<BlueprintDocument[]>` | Searchable, sortable, paginated document table and responsive card layout. |
| `/api/documents/{id}` | `GET` | `ApiResponse<BlueprintDocument>` | Detailed view of document UUID, MIME type, file size, timestamps, and error messages. |
| `/api/documents/{id}/analyze` | `POST` | `ApiResponse<AnalysisResponse>` | Triggers OCR & YOLO pipeline. Handles loading, pending, offline, and completion states. |
| `/api/documents/{id}/download` | `GET` | Binary Stream (`Blob`) | Downloads original file with correct filename or displays inline preview. |
| `/api/documents/{id}/records` | `GET` | `ApiResponse<AnalysisRecord[]>` | Historical execution logs with timestamps, detection counts, OCR counts, and collapsible raw JSON viewer. |
| `/api/documents/{id}` | `DELETE` | `void` | Explicit confirmation modal; deletes stored file and purges database records. |

---

## 6. Documented API Contract Limitations & Missing Fields

The frontend adheres strictly to the real backend data contracts and **never fabricates results**:

1. **`ocrCount` vs. Full OCR Text**:
   - `AnalysisResponse` and `AnalysisRecord` currently return `ocrCount` (an integer count of tokens/words).
   - The Java DTO does **not** expose a top-level `ocrText` field.
   - *Frontend Handling*: The frontend displays the OCR Count directly. If detailed textual transcripts are preserved inside `rawResponseJson`, it defensively parses and renders page-by-page OCR sections; otherwise, it informs the user that text content is not exposed by the current endpoint.

2. **`detectionCount` vs. Component Coordinates**:
   - The Java `AnalysisResponse` returns `detectionCount` (integer total).
   - Component bounding boxes (`[x1, y1, x2, y2]`) and confidence scores are generated by Python's `ComponentDetection`, but the Java DTO stores summary counts.
   - *Frontend Handling*: The UI displays the 14-class reference taxonomy and summary counts. If the raw Python analyzer report is embedded in `rawResponseJson`, it displays the detection table and bounding box overlays; otherwise, it displays an informative notice without inventing fake bounding boxes.

3. **Python ML Connectivity**:
   - Reported via `mlServiceReachable` from Java's `/api/health`.
   - When Python is offline, triggering analysis safely transitions the document to `PENDING_ANALYSIS` and notifies the operator.

---

## 7. Configured Electronic Component Classes (14 Labels)

The YOLO model recognizes the following 14 electronic components:
1. **Resistor**
2. **Capacitor**
3. **Diode**
4. **LED**
5. **Transistor**
6. **Switch**
7. **Battery**
8. **Ground**
9. **Connector**
10. **Fuse**
11. **IC**
12. **Inductor**
13. **Transformer**
14. **Bridge Rectifier**

---

## 8. Troubleshooting

- **Java Backend Unreachable**: Ensure Spring Boot is running on port 8080 (`mvn spring-boot:run`). Check with `curl http://localhost:8080/api/health`.
- **CORS Errors**: The Java backend provides `@CrossOrigin` headers (`Access-Control-Allow-Origin: *`). Verify that request methods include `GET, POST, DELETE, OPTIONS`.
- **Upload Rejected**: Verify that the file size is under 50 MB and the file extension is `.pdf`, `.png`, or `.jpg`/`.jpeg`.

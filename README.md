# Multimodal Agentic RAG for Complex Blueprint & Circuit Analysis

## Core Backend Service (Java Spring Boot)

This is the production-grade **Java Spring Boot** backend for the **Multimodal Agentic RAG for Complex Blueprint & Circuit Analysis** system.

It is designed according to a modern **Microservices Hybrid Architecture**:

- **Java Spring Boot (this service)**: Manages document ingestion, storage validation, metadata persistence, API contracts, security, and orchestration.
- **Python ML Worker (integrated later)**: A dedicated Python microservice running trained YOLOv8 / YOLOv11 symbol detectors and OCR engines.

---

### 1. Prerequisites

- **JDK**: Java 21 LTS (`21.0.10+` verified)
- **Build Tool**: Apache Maven (`3.9.x+` verified)
- **Database**: PostgreSQL 16+ (Database: `blueprint_db`, User: `postgres`)

---

### 2. Project Architecture & Packages

```
src/main/java/com/blueprint/rag/
├── BlueprintAnalysisApplication.java
├── client/                     # Communication interfaces with external services
│   ├── MlServiceClient.java   # Clean abstraction for Python ML YOLO service
│   └── impl/
│       └── HttpMlServiceClient.java
├── config/                     # Portable configuration & bean definitions
│   ├── MlServiceProperties.java
│   ├── RestClientConfig.java
│   ├── StorageProperties.java
│   └── WebConfig.java
├── controller/                 # REST API endpoints
│   ├── AnalysisController.java # Document upload, listing, and analysis triggers
│   └── HealthController.java   # System health and integration diagnostics
├── dto/                        # Request/Response contracts & API envelopes
│   ├── request/
│   │   └── AnalysisRequestDto.java
│   └── response/
│       ├── AnalysisRecordResponse.java
│       ├── AnalysisResponse.java
│       ├── ApiResponse.java
│       ├── DocumentResponse.java
│       ├── HealthResponse.java
│       ├── MlHealthDto.java
│       └── MlInferenceResultDto.java
├── entity/                     # JPA Persistence Entities
│   ├── AnalysisRecord.java
│   ├── BlueprintDocument.java
│   └── DocumentStatus.java
├── exception/                  # Standardized error handling
│   ├── ErrorResponse.java
│   ├── FileStorageException.java
│   ├── GlobalExceptionHandler.java
│   ├── InvalidFileException.java
│   ├── MlServiceException.java
│   ├── MlServiceUnavailableException.java
│   └── ResourceNotFoundException.java
├── repository/                 # Spring Data JPA Repositories
│   ├── AnalysisRecordRepository.java
│   └── BlueprintDocumentRepository.java
└── service/                    # Business logic orchestration
    ├── AnalysisService.java
    ├── FileStorageService.java
    └── impl/
        ├── AnalysisServiceImpl.java
        └── LocalFileStorageServiceImpl.java
```

---

### 3. Build & Run Instructions

#### Compiling & Running Tests:

```powershell
mvn clean test
```

#### Starting the Application:

```powershell
mvn spring-boot:run
```

Alternatively, package and run the JAR:

```powershell
mvn clean package -DskipTests
java -jar target/blueprint-analysis-service-0.0.1-SNAPSHOT.jar
```

The application starts on **`http://localhost:8080`**.

---

### 4. API Endpoints

| HTTP Method | Endpoint                       | Description                                                                            |
| :---------- | :----------------------------- | :------------------------------------------------------------------------------------- |
| `GET`       | `/api/health`                  | Service health, Java version, and ML service connectivity status.                      |
| `POST`      | `/api/documents/upload`        | Multipart file upload (`.pdf`, `.png`, `.jpg`, `.jpeg` up to 50MB).                    |
| `GET`       | `/api/documents`               | Lists all uploaded blueprint documents.                                                |
| `GET`       | `/api/documents/{id}`          | Retrieves metadata for a specific blueprint document.                                  |
| `POST`      | `/api/documents/{id}/analyze`  | Triggers ML analysis (falls back safely to PENDING_ANALYSIS if ML service is offline). |
| `GET`       | `/api/documents/{id}/download` | Downloads the raw blueprint file.                                                      |
| `GET`       | `/api/documents/{id}/records`  | Retrieves past ML analysis records for a document.                                     |
| `DELETE`    | `/api/documents/{id}`          | Deletes the document metadata and deletes the file from `./data/uploads`.              |

#### Database Configuration (PostgreSQL):

The project connects to **PostgreSQL**:
- Database: `blueprint_db`
- Default User: `postgres`
- Default Password: `Meraj@12345`
- Port: `5432`

You can customize the credentials via environment variables if needed:
```powershell
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/blueprint_db"
$env:SPRING_DATASOURCE_USERNAME="postgres"
$env:SPRING_DATASOURCE_PASSWORD="your_postgres_password"

mvn spring-boot:run
```

---

### 5. Connecting the Python YOLO Service Later

When you transfer your trained YOLO weights (`.pt`) from your other laptop:

1. Run your Python FastAPI/Flask inference service on port `8000` (or any other port).
2. Override the target URL via the environment variable:
   ```powershell
   $env:ML_SERVICE_URL="http://localhost:8000"
   mvn spring-boot:run
   ```
3. If the ML service is not yet running, `/api/documents/{id}/analyze` automatically marks the document as `PENDING_ANALYSIS` and returns a clean diagnostic status without throwing unhandled exceptions or inventing fake model detections.

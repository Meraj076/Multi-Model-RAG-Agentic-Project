package com.blueprint.rag.controller;

import com.blueprint.rag.dto.response.AnalysisRecordResponse;
import com.blueprint.rag.dto.response.AnalysisResponse;
import com.blueprint.rag.dto.response.ApiResponse;
import com.blueprint.rag.dto.response.DocumentResponse;
import com.blueprint.rag.service.AnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Tag(name = "Document Analysis", description = "Endpoints for uploading, retrieving, analyzing, and downloading circuit diagrams and blueprints")
@RestController
@RequestMapping("/api/documents")
public class AnalysisController {

    private final AnalysisService analysisService;

    public AnalysisController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @Operation(
            summary = "Upload blueprint or circuit diagram",
            description = "Accepts a PDF, PNG, JPG, or JPEG file up to 50MB. Validates MIME type, stores the file securely, and registers document metadata."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Document uploaded successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid file (empty file, unsupported file extension, or path traversal attempt)"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "413",
                    description = "File exceeds the 50MB maximum permitted upload size"
            )
    })
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<DocumentResponse>> uploadDocument(
            @Parameter(description = "Blueprint file (.pdf, .png, .jpg, .jpeg) up to 50MB", required = true)
            @RequestParam("file") MultipartFile file
    ) {
        DocumentResponse response = analysisService.uploadDocument(file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Blueprint document uploaded successfully", response));
    }

    @Operation(
            summary = "List all documents",
            description = "Retrieves metadata and processing status for all uploaded blueprint documents."
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Documents retrieved successfully"
    )
    @GetMapping
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> getAllDocuments() {
        List<DocumentResponse> documents = analysisService.getAllDocuments();
        return ResponseEntity.ok(ApiResponse.ok("Retrieved documents successfully", documents));
    }

    @Operation(
            summary = "Get document by ID",
            description = "Retrieves metadata and current status for a specific blueprint document."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Document metadata retrieved"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Document not found with the given UUID"
            )
    })
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DocumentResponse>> getDocument(
            @Parameter(description = "Document UUID", required = true)
            @PathVariable("id") UUID id
    ) {
        DocumentResponse document = analysisService.getDocument(id);
        return ResponseEntity.ok(ApiResponse.ok("Document retrieved", document));
    }

    @Operation(
            summary = "Trigger ML analysis on document",
            description = "Sends the document to the Python FastAPI microservice for YOLOv8 circuit component detection and Tesseract OCR text extraction. If the ML service is offline, gracefully updates document status to PENDING_ANALYSIS."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Analysis executed or queued successfully"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Document not found"
            )
    })
    @PostMapping("/{id}/analyze")
    public ResponseEntity<ApiResponse<AnalysisResponse>> analyzeDocument(
            @Parameter(description = "Document UUID to analyze", required = true)
            @PathVariable("id") UUID id
    ) {
        AnalysisResponse analysis = analysisService.triggerAnalysis(id);
        return ResponseEntity.ok(ApiResponse.ok(analysis.message(), analysis));
    }

    @Operation(
            summary = "Download raw blueprint file",
            description = "Streams the original uploaded blueprint file binary (PDF, PNG, JPG) with Content-Disposition attachment."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Raw file binary stream",
                    content = @Content(mediaType = "application/octet-stream")
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Document or physical file not found"
            )
    })
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadFile(
            @Parameter(description = "Document UUID to download", required = true)
            @PathVariable("id") UUID id
    ) {
        DocumentResponse doc = analysisService.getDocument(id);
        Resource resource = analysisService.getDocumentFile(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(doc.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.originalFilename() + "\"")
                .body(resource);
    }

    @Operation(
            summary = "Delete document",
            description = "Deletes the blueprint document metadata, analysis records, and physical file from storage."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Document deleted successfully"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Document not found"
            )
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(
            @Parameter(description = "Document UUID to delete", required = true)
            @PathVariable("id") UUID id
    ) {
        analysisService.deleteDocument(id);
        return ResponseEntity.ok(ApiResponse.ok("Document deleted successfully", null));
    }

    @Operation(
            summary = "Get historical analysis records",
            description = "Retrieves all past ML analysis records for a specific blueprint document, including detection counts, OCR counts, and raw response JSON."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Analysis records retrieved successfully"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Document not found"
            )
    })
    @GetMapping("/{id}/records")
    public ResponseEntity<ApiResponse<List<AnalysisRecordResponse>>> getAnalysisRecords(
            @Parameter(description = "Document UUID", required = true)
            @PathVariable("id") UUID id
    ) {
        List<AnalysisRecordResponse> records = analysisService.getAnalysisRecords(id);
        return ResponseEntity.ok(ApiResponse.ok("Retrieved analysis records", records));
    }
}

package com.blueprint.rag.controller;

import com.blueprint.rag.dto.response.AnalysisResponse;
import com.blueprint.rag.dto.response.ApiResponse;
import com.blueprint.rag.dto.response.DocumentResponse;
import com.blueprint.rag.service.AnalysisService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
public class AnalysisController {

    private final AnalysisService analysisService;

    public AnalysisController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<DocumentResponse>> uploadDocument(
            @RequestParam("file") MultipartFile file
    ) {
        DocumentResponse response = analysisService.uploadDocument(file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Blueprint document uploaded successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> getAllDocuments() {
        List<DocumentResponse> documents = analysisService.getAllDocuments();
        return ResponseEntity.ok(ApiResponse.ok("Retrieved documents successfully", documents));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DocumentResponse>> getDocument(@PathVariable("id") UUID id) {
        DocumentResponse document = analysisService.getDocument(id);
        return ResponseEntity.ok(ApiResponse.ok("Document retrieved", document));
    }

    @PostMapping("/{id}/analyze")
    public ResponseEntity<ApiResponse<AnalysisResponse>> analyzeDocument(@PathVariable("id") UUID id) {
        AnalysisResponse analysis = analysisService.triggerAnalysis(id);
        return ResponseEntity.ok(ApiResponse.ok(analysis.message(), analysis));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadFile(@PathVariable("id") UUID id) {
        DocumentResponse doc = analysisService.getDocument(id);
        Resource resource = analysisService.getDocumentFile(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(doc.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.originalFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable("id") UUID id) {
        analysisService.deleteDocument(id);
        return ResponseEntity.ok(ApiResponse.ok("Document deleted successfully", null));
    }

    @GetMapping("/{id}/records")
    public ResponseEntity<ApiResponse<List<com.blueprint.rag.dto.response.AnalysisRecordResponse>>> getAnalysisRecords(@PathVariable("id") UUID id) {
        List<com.blueprint.rag.dto.response.AnalysisRecordResponse> records = analysisService.getAnalysisRecords(id);
        return ResponseEntity.ok(ApiResponse.ok("Retrieved analysis records", records));
    }
}

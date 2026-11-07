package com.blueprint.rag.service.impl;

import com.blueprint.rag.client.MlServiceClient;
import com.blueprint.rag.config.MlServiceProperties;
import com.blueprint.rag.config.StorageProperties;
import com.blueprint.rag.dto.response.AnalysisRecordResponse;
import com.blueprint.rag.dto.response.AnalysisResponse;
import com.blueprint.rag.dto.response.DocumentResponse;
import com.blueprint.rag.dto.response.HealthResponse;
import com.blueprint.rag.dto.response.MlInferenceResultDto;
import com.blueprint.rag.entity.AnalysisRecord;
import com.blueprint.rag.entity.BlueprintDocument;
import com.blueprint.rag.entity.DocumentStatus;
import com.blueprint.rag.exception.ResourceNotFoundException;
import com.blueprint.rag.repository.AnalysisRecordRepository;
import com.blueprint.rag.repository.BlueprintDocumentRepository;
import com.blueprint.rag.service.AnalysisService;
import com.blueprint.rag.service.FileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AnalysisServiceImpl implements AnalysisService {

    private static final Logger log = LoggerFactory.getLogger(AnalysisServiceImpl.class);

    private final BlueprintDocumentRepository documentRepository;
    private final AnalysisRecordRepository analysisRecordRepository;
    private final FileStorageService fileStorageService;
    private final MlServiceClient mlServiceClient;
    private final MlServiceProperties mlServiceProperties;
    private final StorageProperties storageProperties;

    public AnalysisServiceImpl(
            BlueprintDocumentRepository documentRepository,
            AnalysisRecordRepository analysisRecordRepository,
            FileStorageService fileStorageService,
            MlServiceClient mlServiceClient,
            MlServiceProperties mlServiceProperties,
            StorageProperties storageProperties
    ) {
        this.documentRepository = documentRepository;
        this.analysisRecordRepository = analysisRecordRepository;
        this.fileStorageService = fileStorageService;
        this.mlServiceClient = mlServiceClient;
        this.mlServiceProperties = mlServiceProperties;
        this.storageProperties = storageProperties;
    }

    @Override
    @Transactional
    public DocumentResponse uploadDocument(MultipartFile file) {
        fileStorageService.validateFile(file);

        String rawName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
        String cleanOriginalName = StringUtils.cleanPath(rawName);
        String uniqueStoredFilename = UUID.randomUUID() + "_" + cleanOriginalName;

        Path storedPath = fileStorageService.store(file, uniqueStoredFilename);

        BlueprintDocument document = new BlueprintDocument(
                cleanOriginalName,
                uniqueStoredFilename,
                file.getContentType() != null ? file.getContentType() : "application/octet-stream",
                file.getSize(),
                storedPath.toString()
        );

        BlueprintDocument saved = documentRepository.save(document);
        log.info("Registered blueprint document in database with ID: {}", saved.getId());

        return DocumentResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public DocumentResponse getDocument(UUID id) {
        BlueprintDocument document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BlueprintDocument", id));
        return DocumentResponse.fromEntity(document);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentResponse> getAllDocuments() {
        return documentRepository.findAll().stream()
                .map(DocumentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AnalysisResponse triggerAnalysis(UUID id) {
        BlueprintDocument document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BlueprintDocument", id));

        boolean mlReachable = mlServiceClient.isAvailable();

        if (!mlReachable) {
            String pendingMessage = String.format(
                    "Python ML service is currently offline at '%s'. Trained YOLO weights and vision engine have not yet been connected on this machine.",
                    mlServiceProperties.getBaseUrl()
            );

            document.setStatus(DocumentStatus.PENDING_ANALYSIS);
            document.setErrorMessage(pendingMessage);
            documentRepository.save(document);

            log.info("Document {} marked as PENDING_ANALYSIS (ML service offline at {})",
                    id, mlServiceProperties.getBaseUrl());

            return new AnalysisResponse(
                    document.getId(),
                    document.getStatus(),
                    mlServiceProperties.getBaseUrl(),
                    false,
                    null,
                    null,
                    pendingMessage,
                    Instant.now()
            );
        }

        // ML Service is reachable, proceed with real inference call
        try {
            document.setStatus(DocumentStatus.ANALYZING);
            documentRepository.save(document);

            Path filePath = fileStorageService.getPath(document.getStoredFilename());
            MlInferenceResultDto mlResult = mlServiceClient.analyzeDocument(filePath, document.getId());

            AnalysisRecord record = new AnalysisRecord(
                    document,
                    mlResult.modelName() != null ? mlResult.modelName() : "yolov8-custom",
                    mlResult.rawJson(),
                    mlResult.detectionCount(),
                    mlResult.ocrCount()
            );
            analysisRecordRepository.save(record);

            document.setStatus(DocumentStatus.COMPLETED);
            document.setErrorMessage(null);
            documentRepository.save(document);

            return new AnalysisResponse(
                    document.getId(),
                    document.getStatus(),
                    mlServiceProperties.getBaseUrl(),
                    true,
                    mlResult.detectionCount(),
                    mlResult.ocrCount(),
                    "Analysis completed successfully by connected ML service.",
                    Instant.now()
            );

        } catch (Exception ex) {
            log.error("Analysis execution failed for document {}: {}", id, ex.getMessage(), ex);
            document.setStatus(DocumentStatus.FAILED);
            document.setErrorMessage("Analysis failed: " + ex.getMessage());
            documentRepository.save(document);

            return new AnalysisResponse(
                    document.getId(),
                    document.getStatus(),
                    mlServiceProperties.getBaseUrl(),
                    true,
                    null,
                    null,
                    "Analysis execution failed: " + ex.getMessage(),
                    Instant.now()
            );
        }
    }

    @Override
    @Transactional(readOnly = true)
    public HealthResponse getSystemHealth() {
        boolean mlReachable = mlServiceClient.isAvailable();
        return new HealthResponse(
                "UP",
                "blueprint-analysis-service",
                System.getProperty("java.version"),
                storageProperties.getUploadDir(),
                mlServiceProperties.getBaseUrl(),
                mlReachable,
                Instant.now()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Resource getDocumentFile(UUID id) {
        BlueprintDocument document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BlueprintDocument", id));
        return fileStorageService.loadAsResource(document.getStoredFilename());
    }

    @Override
    @Transactional
    public void deleteDocument(UUID id) {
        BlueprintDocument document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BlueprintDocument", id));
        fileStorageService.delete(document.getStoredFilename());
        documentRepository.delete(document);
        log.info("Deleted document ID {} and associated file {}", id, document.getStoredFilename());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnalysisRecordResponse> getAnalysisRecords(UUID documentId) {
        if (!documentRepository.existsById(documentId)) {
            throw new ResourceNotFoundException("BlueprintDocument", documentId);
        }
        return analysisRecordRepository.findByDocumentId(documentId).stream()
                .map(AnalysisRecordResponse::fromEntity)
                .collect(Collectors.toList());
    }
}

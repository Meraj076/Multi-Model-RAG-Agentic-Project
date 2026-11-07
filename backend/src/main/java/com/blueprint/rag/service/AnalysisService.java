package com.blueprint.rag.service;

import com.blueprint.rag.dto.response.AnalysisResponse;
import com.blueprint.rag.dto.response.DocumentResponse;
import com.blueprint.rag.dto.response.HealthResponse;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface AnalysisService {

    /**
     * Uploads and stores a schematic or blueprint document.
     *
     * @param file the uploaded MultipartFile
     * @return DocumentResponse metadata
     */
    DocumentResponse uploadDocument(MultipartFile file);

    /**
     * Retrieves metadata for a specific document.
     *
     * @param id Document unique ID
     * @return DocumentResponse
     */
    DocumentResponse getDocument(UUID id);

    /**
     * Retrieves all stored blueprint documents.
     *
     * @return list of DocumentResponse
     */
    List<DocumentResponse> getAllDocuments();

    /**
     * Triggers analysis of the document by invoking the Python ML service.
     *
     * @param id Document unique ID
     * @return AnalysisResponse
     */
    AnalysisResponse triggerAnalysis(UUID id);

    /**
     * Returns application and downstream integration health status.
     *
     * @return HealthResponse
     */
    HealthResponse getSystemHealth();

    /**
     * Retrieves the stored file as a downloadable resource.
     *
     * @param id Document unique ID
     * @return Resource
     */
    Resource getDocumentFile(UUID id);

    /**
     * Deletes a document and its stored file from disk.
     *
     * @param id Document unique ID
     */
    void deleteDocument(UUID id);

    /**
     * Retrieves all analysis records associated with a document.
     *
     * @param documentId Document unique ID
     * @return List of AnalysisRecordResponse
     */
    List<com.blueprint.rag.dto.response.AnalysisRecordResponse> getAnalysisRecords(UUID documentId);
}


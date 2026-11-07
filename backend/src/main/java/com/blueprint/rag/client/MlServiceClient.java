package com.blueprint.rag.client;

import com.blueprint.rag.dto.response.MlHealthDto;
import com.blueprint.rag.dto.response.MlInferenceResultDto;

import java.nio.file.Path;
import java.util.UUID;

public interface MlServiceClient {

    /**
     * Checks if the downstream Python ML / YOLO microservice is reachable.
     *
     * @return true if the service responds with HTTP 200, false otherwise.
     */
    boolean isAvailable();

    /**
     * Retrieves health and model status metadata from the Python service.
     *
     * @return MlHealthDto metadata.
     */
    MlHealthDto getHealth();

    /**
     * Sends a blueprint document to the Python ML service for symbol detection and OCR extraction.
     *
     * @param filePath Path to the stored document file.
     * @param documentId Document unique identifier.
     * @return MlInferenceResultDto containing raw detection and OCR bounding boxes.
     */
    MlInferenceResultDto analyzeDocument(Path filePath, UUID documentId);
}

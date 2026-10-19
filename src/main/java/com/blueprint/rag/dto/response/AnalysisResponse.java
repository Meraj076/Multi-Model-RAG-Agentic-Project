package com.blueprint.rag.dto.response;

import com.blueprint.rag.entity.DocumentStatus;

import java.time.Instant;
import java.util.UUID;

public record AnalysisResponse(
        UUID documentId,
        DocumentStatus status,
        String mlServiceUrl,
        boolean mlServiceReachable,
        Integer detectionCount,
        Integer ocrCount,
        String message,
        Instant timestamp
) {}

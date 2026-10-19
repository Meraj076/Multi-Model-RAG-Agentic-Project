package com.blueprint.rag.dto.response;

import com.blueprint.rag.entity.AnalysisRecord;

import java.time.Instant;
import java.util.UUID;

public record AnalysisRecordResponse(
        UUID id,
        UUID documentId,
        String modelName,
        Integer detectionCount,
        Integer ocrCount,
        String rawResponseJson,
        Instant analyzedAt
) {
    public static AnalysisRecordResponse fromEntity(AnalysisRecord record) {
        return new AnalysisRecordResponse(
                record.getId(),
                record.getDocument().getId(),
                record.getModelName(),
                record.getDetectionCount(),
                record.getOcrCount(),
                record.getRawResponseJson(),
                record.getAnalyzedAt()
        );
    }
}

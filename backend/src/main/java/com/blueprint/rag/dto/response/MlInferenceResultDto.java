package com.blueprint.rag.dto.response;

import java.util.List;
import java.util.Map;

public record MlInferenceResultDto(
        String documentId,
        String modelName,
        Integer detectionCount,
        Integer ocrCount,
        List<Map<String, Object>> detections,
        List<Map<String, Object>> ocrBlocks,
        String rawJson
) {}

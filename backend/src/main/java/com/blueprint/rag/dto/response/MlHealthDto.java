package com.blueprint.rag.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * DTO for the Python FastAPI ML service /health response.
 *
 * Python returns:
 *   { "status": "ok|degraded", "modelName": "...", "version": "...",
 *     "service": "...", "modelLoaded": true, "tesseractAvailable": true }
 *
 * Java-required fields: status, modelName, version.
 * Additional Python fields are ignored gracefully via @JsonIgnoreProperties.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record MlHealthDto(
        String status,
        String modelName,
        String version,
        String service,
        Boolean modelLoaded,
        Boolean tesseractAvailable
) {}
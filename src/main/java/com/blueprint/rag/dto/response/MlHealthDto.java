package com.blueprint.rag.dto.response;

public record MlHealthDto(
        String status,
        String modelName,
        String version
) {}

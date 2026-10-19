package com.blueprint.rag.dto.response;

import java.time.Instant;

public record HealthResponse(
        String status,
        String applicationName,
        String javaVersion,
        String storageDirectory,
        String mlServiceUrl,
        boolean mlServiceReachable,
        Instant timestamp
) {}

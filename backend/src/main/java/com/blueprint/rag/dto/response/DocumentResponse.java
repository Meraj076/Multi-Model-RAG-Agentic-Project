package com.blueprint.rag.dto.response;

import com.blueprint.rag.entity.BlueprintDocument;
import com.blueprint.rag.entity.DocumentStatus;

import java.time.Instant;
import java.util.UUID;

public record DocumentResponse(
        UUID id,
        String originalFilename,
        String storedFilename,
        String contentType,
        Long fileSizeBytes,
        DocumentStatus status,
        String errorMessage,
        Instant createdAt,
        Instant updatedAt
) {
    public static DocumentResponse fromEntity(BlueprintDocument entity) {
        return new DocumentResponse(
                entity.getId(),
                entity.getOriginalFilename(),
                entity.getStoredFilename(),
                entity.getContentType(),
                entity.getFileSizeBytes(),
                entity.getStatus(),
                entity.getErrorMessage(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}

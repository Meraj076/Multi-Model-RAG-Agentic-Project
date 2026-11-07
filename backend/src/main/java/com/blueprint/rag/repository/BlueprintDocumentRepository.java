package com.blueprint.rag.repository;

import com.blueprint.rag.entity.BlueprintDocument;
import com.blueprint.rag.entity.DocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BlueprintDocumentRepository extends JpaRepository<BlueprintDocument, UUID> {

    Optional<BlueprintDocument> findByStoredFilename(String storedFilename);

    List<BlueprintDocument> findByStatus(DocumentStatus status);
}

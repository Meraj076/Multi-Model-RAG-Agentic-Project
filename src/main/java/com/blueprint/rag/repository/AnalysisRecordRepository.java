package com.blueprint.rag.repository;

import com.blueprint.rag.entity.AnalysisRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AnalysisRecordRepository extends JpaRepository<AnalysisRecord, UUID> {

    List<AnalysisRecord> findByDocumentId(UUID documentId);
}

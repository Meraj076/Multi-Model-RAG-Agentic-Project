package com.blueprint.rag.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "analysis_records")
public class AnalysisRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id", nullable = false)
    private BlueprintDocument document;

    @Column(nullable = false)
    private String modelName;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String rawResponseJson;

    private Integer detectionCount;

    private Integer ocrCount;

    @Column(nullable = false, updatable = false)
    private Instant analyzedAt;

    public AnalysisRecord() {
    }

    public AnalysisRecord(BlueprintDocument document, String modelName, String rawResponseJson, Integer detectionCount, Integer ocrCount) {
        this.document = document;
        this.modelName = modelName;
        this.rawResponseJson = rawResponseJson;
        this.detectionCount = detectionCount;
        this.ocrCount = ocrCount;
    }

    @PrePersist
    protected void onCreate() {
        this.analyzedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public BlueprintDocument getDocument() {
        return document;
    }

    public void setDocument(BlueprintDocument document) {
        this.document = document;
    }

    public String getModelName() {
        return modelName;
    }

    public void setModelName(String modelName) {
        this.modelName = modelName;
    }

    public String getRawResponseJson() {
        return rawResponseJson;
    }

    public void setRawResponseJson(String rawResponseJson) {
        this.rawResponseJson = rawResponseJson;
    }

    public Integer getDetectionCount() {
        return detectionCount;
    }

    public void setDetectionCount(Integer detectionCount) {
        this.detectionCount = detectionCount;
    }

    public Integer getOcrCount() {
        return ocrCount;
    }

    public void setOcrCount(Integer ocrCount) {
        this.ocrCount = ocrCount;
    }

    public Instant getAnalyzedAt() {
        return analyzedAt;
    }

    public void setAnalyzedAt(Instant analyzedAt) {
        this.analyzedAt = analyzedAt;
    }
}

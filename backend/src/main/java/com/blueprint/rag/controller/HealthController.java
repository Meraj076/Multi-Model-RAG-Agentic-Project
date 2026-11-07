package com.blueprint.rag.controller;

import com.blueprint.rag.dto.response.ApiResponse;
import com.blueprint.rag.dto.response.HealthResponse;
import com.blueprint.rag.service.AnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final AnalysisService analysisService;

    public HealthController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<HealthResponse>> getHealth() {
        HealthResponse health = analysisService.getSystemHealth();
        return ResponseEntity.ok(ApiResponse.ok("System is operational", health));
    }
}

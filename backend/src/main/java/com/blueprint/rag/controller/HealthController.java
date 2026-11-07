package com.blueprint.rag.controller;

import com.blueprint.rag.dto.response.ApiResponse;
import com.blueprint.rag.dto.response.HealthResponse;
import com.blueprint.rag.service.AnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "System Health", description = "Health checks and microservice connectivity diagnostics")
@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final AnalysisService analysisService;

    public HealthController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @Operation(
            summary = "System health check",
            description = "Checks operational health across the Java backend, PostgreSQL database, and Python ML microservice."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "System is operational or degraded status retrieved",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500",
                    description = "Internal server error during health assessment"
            )
    })
    @GetMapping
    public ResponseEntity<ApiResponse<HealthResponse>> getHealth() {
        HealthResponse health = analysisService.getSystemHealth();
        return ResponseEntity.ok(ApiResponse.ok("System is operational", health));
    }
}

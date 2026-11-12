package com.blueprint.rag.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@Tag(name = "Keep-Alive", description = "Lightweight keep-alive endpoint for self-polling")
@RestController
@RequestMapping("/api/keepalive")
public class KeepAliveController {

    @Operation(
            summary = "Lightweight keep-alive ping",
            description = "Performs a lightweight random calculation and returns alive status without hitting the database."
    )
    @GetMapping
    public ResponseEntity<Map<String, Object>> keepAlive() {
        double calcResult = performLightweightCalculation();

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("status", "alive");
        payload.put("service", "blueprint-analysis-service");
        payload.put("timestamp", Instant.now().toString());
        payload.put("calculationResult", calcResult);

        return ResponseEntity.ok(payload);
    }

    public static double performLightweightCalculation() {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        double seed = random.nextDouble(1.0, 100.0);
        double acc = seed;
        for (int i = 1; i <= 500; i++) {
            acc = (acc * 1.00013 + Math.sin(seed + i)) % 10000.0;
        }
        return Math.round(acc * 10000.0) / 10000.0;
    }
}


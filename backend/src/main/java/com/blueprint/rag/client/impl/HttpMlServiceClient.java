package com.blueprint.rag.client.impl;

import com.blueprint.rag.client.MlServiceClient;
import com.blueprint.rag.config.MlServiceProperties;
import com.blueprint.rag.dto.response.MlHealthDto;
import com.blueprint.rag.dto.response.MlInferenceResultDto;
import com.blueprint.rag.exception.MlServiceException;
import com.blueprint.rag.exception.MlServiceUnavailableException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Component
public class HttpMlServiceClient implements MlServiceClient {

    private static final Logger log = LoggerFactory.getLogger(HttpMlServiceClient.class);

    private final RestClient mlRestClient;
    private final MlServiceProperties mlServiceProperties;

    public HttpMlServiceClient(RestClient mlRestClient, MlServiceProperties mlServiceProperties) {
        this.mlRestClient = mlRestClient;
        this.mlServiceProperties = mlServiceProperties;
    }

    @Override
    public boolean isAvailable() {
        try {
            mlRestClient.get()
                    .uri("/health")
                    .retrieve()
                    .toBodilessEntity();
            return true;
        } catch (Exception ex) {
            log.debug("ML Service at {} is not reachable: {}", mlServiceProperties.getBaseUrl(), ex.getMessage());
            return false;
        }
    }

    @Override
    public MlHealthDto getHealth() {
        try {
            return mlRestClient.get()
                    .uri("/health")
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(MlHealthDto.class);
        } catch (RestClientException ex) {
            throw new MlServiceUnavailableException(
                    String.format("Unable to connect to ML service at %s: %s",
                            mlServiceProperties.getBaseUrl(), ex.getMessage()), ex);
        }
    }

    @Override
    public MlInferenceResultDto analyzeDocument(Path filePath, UUID documentId) {
        if (!Files.exists(filePath)) {
            throw new IllegalArgumentException("File path does not exist: " + filePath);
        }

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new FileSystemResource(filePath.toFile()));
        body.add("document_id", documentId.toString());

        try {
            log.info("Sending document {} ({}) to ML service at {}/analyze",
                    documentId, filePath.getFileName(), mlServiceProperties.getBaseUrl());

            return mlRestClient.post()
                    .uri("/analyze")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(MlInferenceResultDto.class);

        } catch (RestClientException ex) {
            log.warn("Failed calling ML service at {}: {}", mlServiceProperties.getBaseUrl(), ex.getMessage());
            throw new MlServiceUnavailableException(
                    String.format("Python ML service at '%s' is offline or unreachable. " +
                            "Please ensure the YOLO microservice is running and ML_SERVICE_URL is properly configured.",
                            mlServiceProperties.getBaseUrl()), ex);
        } catch (Exception ex) {
            throw new MlServiceException("Unexpected error during ML inference communication: " + ex.getMessage(), ex);
        }
    }
}

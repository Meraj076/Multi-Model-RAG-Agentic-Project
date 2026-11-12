package com.blueprint.rag.service;

import com.blueprint.rag.config.MlServiceProperties;
import com.blueprint.rag.controller.KeepAliveController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Service
@ConditionalOnProperty(name = "keepalive.enabled", havingValue = "true", matchIfMissing = true)
public class KeepAliveScheduler {

    private static final Logger log = LoggerFactory.getLogger(KeepAliveScheduler.class);

    private final RestClient pingRestClient;
    private final String selfBaseUrl;
    private final String mlBaseUrl;
    private final boolean pingMlService;

    public KeepAliveScheduler(
            @Value("${keepalive.self-url}") String selfBaseUrl,
            @Value("${keepalive.ping-ml-service:true}") boolean pingMlService,
            MlServiceProperties mlServiceProperties
    ) {
        this.selfBaseUrl = stripTrailingSlash(selfBaseUrl);
        this.mlBaseUrl = stripTrailingSlash(mlServiceProperties.getBaseUrl());
        this.pingMlService = pingMlService;

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(10));
        factory.setReadTimeout(Duration.ofSeconds(15));
        this.pingRestClient = RestClient.builder()
                .requestFactory(factory)
                .build();
    }

    @Scheduled(fixedDelayString = "${keepalive.interval-ms:180000}", initialDelay = 30000)
    public void selfPollAndCalculate() {
        double calcResult = KeepAliveController.performLightweightCalculation();
        log.debug("[KeepAlive] Random calculation result={}", calcResult);

        pingEndpoint(selfBaseUrl + "/api/keepalive", "backend-self");

        if (pingMlService && mlBaseUrl != null && !mlBaseUrl.isBlank()) {
            pingEndpoint(mlBaseUrl + "/keepalive", "ml-service");
        }
    }

    private void pingEndpoint(String url, String targetName) {
        try {
            String response = pingRestClient.get()
                    .uri(url)
                    .retrieve()
                    .body(String.class);
            log.info("[KeepAlive] Pinged {} ({}) -> OK: {}", targetName, url, response);
        } catch (Exception ex) {
            log.warn("[KeepAlive] Ping failed for {} ({}): {}", targetName, url, ex.getMessage());
        }
    }

    private static String stripTrailingSlash(String url) {
        if (url == null) {
            return "";
        }
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }
}


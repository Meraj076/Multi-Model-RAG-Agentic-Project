package com.blueprint.rag.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
public class RestClientConfig {

    private final MlServiceProperties mlServiceProperties;

    public RestClientConfig(MlServiceProperties mlServiceProperties) {
        this.mlServiceProperties = mlServiceProperties;
    }

    @Bean
    public RestClient mlRestClient() {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofMillis(mlServiceProperties.getConnectTimeoutMs()));
        requestFactory.setReadTimeout(Duration.ofMillis(mlServiceProperties.getReadTimeoutMs()));

        return RestClient.builder()
                .baseUrl(mlServiceProperties.getBaseUrl())
                .requestFactory(requestFactory)
                .build();
    }
}

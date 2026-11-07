package com.blueprint.rag.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI 3.0 / Swagger UI Configuration for Blueprint Analysis Service.
 *
 * Configures API metadata, tags, and environment-aware server URLs.
 */
@Configuration
public class OpenApiConfig {

    @Value("${server.port:8080}")
    private String serverPort;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Multimodal Blueprint & Circuit Analysis API")
                        .version("1.0.0")
                        .description("RESTful API orchestrator for Multimodal Agentic RAG for Complex Blueprint & Circuit Analysis. "
                                + "Manages document ingestion, storage validation, metadata persistence, YOLOv8 symbol detection, and Tesseract OCR integration.")
                        .contact(new Contact()
                                .name("Meraj")
                                .url("https://github.com/Meraj076/Multi-Model-RAG-Agentic-Project"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")))
                .tags(List.of(
                        new Tag().name("Document Analysis").description("Endpoints for uploading, retrieving, analyzing, and downloading circuit diagrams and blueprints"),
                        new Tag().name("System Health").description("Health check and microservice connectivity diagnostics")
                ))
                .servers(List.of(
                        new Server().url("/").description("Current Server (Relative path — works for both HTTPS and HTTP)"),
                        new Server().url("https://blueprint-java-backend.onrender.com").description("Production Cloud Backend (Render)"),
                        new Server().url("http://localhost:" + serverPort).description("Local Development Server")
                ));
    }
}

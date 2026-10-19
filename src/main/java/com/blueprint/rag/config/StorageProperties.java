package com.blueprint.rag.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;
import java.util.Arrays;
import java.util.List;

@ConfigurationProperties(prefix = "storage")
@Validated
public class StorageProperties {

    @NotBlank
    private String uploadDir = "./data/uploads";

    private List<String> allowedContentTypes = Arrays.asList(
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/jpg"
    );

    public String getUploadDir() {
        return uploadDir;
    }

    public void setUploadDir(String uploadDir) {
        this.uploadDir = uploadDir;
    }

    public List<String> getAllowedContentTypes() {
        return allowedContentTypes;
    }

    public void setAllowedContentTypes(List<String> allowedContentTypes) {
        this.allowedContentTypes = allowedContentTypes;
    }
}

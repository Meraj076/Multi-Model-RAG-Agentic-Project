package com.blueprint.rag;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class BlueprintAnalysisApplication {

    public static void main(String[] args) {
        SpringApplication.run(BlueprintAnalysisApplication.class, args);
    }
}

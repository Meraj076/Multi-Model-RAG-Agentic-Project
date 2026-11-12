package com.blueprint.rag;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@ConfigurationPropertiesScan
@EnableScheduling
public class BlueprintAnalysisApplication {

    public static void main(String[] args) {
        SpringApplication.run(BlueprintAnalysisApplication.class, args);
    }
}

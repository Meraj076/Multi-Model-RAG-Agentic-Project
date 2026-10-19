package com.blueprint.rag.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AnalysisControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void uploadDocument_validPdf_shouldReturnCreated() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "circuit_diagram.pdf",
                "application/pdf",
                "%PDF-1.4 sample blueprint binary content".getBytes()
        );

        mockMvc.perform(multipart("/api/documents/upload").file(file))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.originalFilename").value("circuit_diagram.pdf"))
                .andExpect(jsonPath("$.data.status").value("UPLOADED"))
                .andExpect(jsonPath("$.data.id").exists());
    }

    @Test
    void uploadDocument_emptyFile_shouldReturnBadRequest() throws Exception {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file",
                "empty.pdf",
                "application/pdf",
                new byte[0]
        );

        mockMvc.perform(multipart("/api/documents/upload").file(emptyFile))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Cannot upload an empty file."));
    }

    @Test
    void uploadDocument_disallowedExtension_shouldReturnBadRequest() throws Exception {
        MockMultipartFile invalidFile = new MockMultipartFile(
                "file",
                "script.sh",
                "text/x-shellscript",
                "echo test".getBytes()
        );

        mockMvc.perform(multipart("/api/documents/upload").file(invalidFile))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    @Test
    void getDocument_nonExistentId_shouldReturnNotFound() throws Exception {
        UUID randomId = UUID.randomUUID();

        mockMvc.perform(get("/api/documents/" + randomId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void analyzeDocument_whenMlServiceOffline_shouldGracefullyReturnPendingStatus() throws Exception {
        // 1. Upload a valid document first
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "schematic_board.png",
                "image/png",
                new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47}
        );

        MvcResult uploadResult = mockMvc.perform(multipart("/api/documents/upload").file(file))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode root = objectMapper.readTree(uploadResult.getResponse().getContentAsString());
        String documentId = root.get("data").get("id").asText();

        // 2. Trigger analysis - ML service is offline on this laptop
        mockMvc.perform(post("/api/documents/" + documentId + "/analyze"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.documentId").value(documentId))
                .andExpect(jsonPath("$.data.status").value("PENDING_ANALYSIS"))
                .andExpect(jsonPath("$.data.mlServiceReachable").value(false))
                .andExpect(jsonPath("$.data.message").value(org.hamcrest.Matchers.containsString("offline")));
    }

    @Test
    void deleteDocument_existingId_shouldDeleteAndReturnOk() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "to_delete.png",
                "image/png",
                new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47}
        );

        MvcResult uploadResult = mockMvc.perform(multipart("/api/documents/upload").file(file))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode root = objectMapper.readTree(uploadResult.getResponse().getContentAsString());
        String documentId = root.get("data").get("id").asText();

        // Delete document
        mockMvc.perform(delete("/api/documents/" + documentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Document deleted successfully"));

        // Verify document is now 404
        mockMvc.perform(get("/api/documents/" + documentId))
                .andExpect(status().isNotFound());
    }

    @Test
    void getAnalysisRecords_shouldReturnRecordsList() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "record_test.pdf",
                "application/pdf",
                "%PDF-1.4 record test".getBytes()
        );

        MvcResult uploadResult = mockMvc.perform(multipart("/api/documents/upload").file(file))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode root = objectMapper.readTree(uploadResult.getResponse().getContentAsString());
        String documentId = root.get("data").get("id").asText();

        mockMvc.perform(get("/api/documents/" + documentId + "/records"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }
}

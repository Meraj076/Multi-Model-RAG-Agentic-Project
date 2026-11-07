package com.blueprint.rag.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;

public interface FileStorageService {

    /**
     * Stores an uploaded file to the configured storage directory.
     *
     * @param file the incoming multipart file
     * @param targetFilename unique filename to persist
     * @return Path to the stored file
     */
    Path store(MultipartFile file, String targetFilename);

    /**
     * Validates that the uploaded file meets size and type constraints.
     *
     * @param file the incoming multipart file
     */
    void validateFile(MultipartFile file);

    /**
     * Resolves the stored file as a Spring Resource.
     *
     * @param storedFilename the unique filename on disk
     * @return Spring Resource
     */
    Resource loadAsResource(String storedFilename);

    /**
     * Resolves the Path for a stored filename.
     *
     * @param storedFilename the unique filename on disk
     * @return Path
     */
    Path getPath(String storedFilename);

    /**
     * Deletes a stored file if it exists.
     *
     * @param storedFilename the unique filename on disk
     */
    void delete(String storedFilename);
}

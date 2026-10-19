package com.blueprint.rag.service.impl;

import com.blueprint.rag.config.StorageProperties;
import com.blueprint.rag.exception.FileStorageException;
import com.blueprint.rag.exception.InvalidFileException;
import com.blueprint.rag.service.FileStorageService;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.Locale;

@Service
public class LocalFileStorageServiceImpl implements FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(LocalFileStorageServiceImpl.class);

    private final Path rootLocation;
    private final StorageProperties storageProperties;

    public LocalFileStorageServiceImpl(StorageProperties storageProperties) {
        this.storageProperties = storageProperties;
        this.rootLocation = Paths.get(storageProperties.getUploadDir()).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(rootLocation);
            log.info("Initialized file storage directory at: {}", rootLocation);
        } catch (IOException e) {
            throw new FileStorageException("Could not initialize storage directory: " + rootLocation, e);
        }
    }

    @Override
    public void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("Cannot upload an empty file.");
        }

        String originalFilename = file.getOriginalFilename();
        if (!StringUtils.hasText(originalFilename)) {
            throw new InvalidFileException("Uploaded file must have a valid filename.");
        }

        // Check for path traversal attacks
        if (originalFilename.contains("..") || originalFilename.contains("/") || originalFilename.contains("\\")) {
            throw new InvalidFileException("Filename contains invalid path sequence: " + originalFilename);
        }

        // Validate MIME type
        String contentType = file.getContentType();
        if (contentType != null 
                && !contentType.equalsIgnoreCase("application/octet-stream")
                && !storageProperties.getAllowedContentTypes().contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new InvalidFileException(String.format(
                    "Invalid file content type '%s'. Allowed types: %s",
                    contentType, storageProperties.getAllowedContentTypes()));
        }

        // Validate Extension as fallback
        String lowerFilename = originalFilename.toLowerCase(Locale.ROOT);
        boolean hasAllowedExtension = lowerFilename.endsWith(".pdf") ||
                lowerFilename.endsWith(".png") ||
                lowerFilename.endsWith(".jpg") ||
                lowerFilename.endsWith(".jpeg");

        if (!hasAllowedExtension) {
            throw new InvalidFileException("Invalid file extension. Only .pdf, .png, .jpg, and .jpeg are allowed.");
        }
    }

    @Override
    public Path store(MultipartFile file, String targetFilename) {
        validateFile(file);

        try {
            Path destinationFile = this.rootLocation.resolve(Paths.get(targetFilename)).normalize().toAbsolutePath();

            if (!destinationFile.getParent().equals(this.rootLocation)) {
                throw new FileStorageException("Cannot store file outside current storage directory.");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
                log.info("Stored file {} ({} bytes) successfully at {}", targetFilename, file.getSize(), destinationFile);
            }

            return destinationFile;
        } catch (IOException e) {
            throw new FileStorageException("Failed to store file: " + targetFilename, e);
        }
    }

    @Override
    public Resource loadAsResource(String storedFilename) {
        try {
            Path file = rootLocation.resolve(storedFilename).normalize();
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new FileStorageException("Could not read file: " + storedFilename);
            }
        } catch (MalformedURLException e) {
            throw new FileStorageException("Malformed URL for file: " + storedFilename, e);
        }
    }

    @Override
    public Path getPath(String storedFilename) {
        return rootLocation.resolve(storedFilename).normalize();
    }

    @Override
    public void delete(String storedFilename) {
        try {
            Path file = rootLocation.resolve(storedFilename).normalize();
            Files.deleteIfExists(file);
            log.info("Deleted file {}", storedFilename);
        } catch (IOException e) {
            log.warn("Could not delete file {}: {}", storedFilename, e.getMessage());
        }
    }
}

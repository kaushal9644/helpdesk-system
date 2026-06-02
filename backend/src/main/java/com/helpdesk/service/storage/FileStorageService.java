package com.helpdesk.service.storage;

import java.nio.file.Path;

import org.springframework.web.multipart.MultipartFile;

/**
 * Physical file storage abstraction.
 */
public interface FileStorageService {

    /**
     * Stores a file on disk and returns the stored file metadata.
     */
    StoredFile store(MultipartFile file, String ticketFolderName);

    /**
     * Deletes a stored file (no error if already missing).
     */
    void delete(Path absolutePath);
}


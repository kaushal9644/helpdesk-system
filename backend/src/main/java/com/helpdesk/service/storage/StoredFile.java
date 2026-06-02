package com.helpdesk.service.storage;

import java.nio.file.Path;

import lombok.Builder;
import lombok.Getter;

/**
 * Result of storing a file.
 */
@Getter
@Builder
public class StoredFile {

    /** Filename used on disk. */
    private String storedFileName;
    /** Original filename from client. */
    private String originalFileName;
    /** MIME type. */
    private String contentType;
    /** Size in bytes. */
    private long size;
    /** Absolute path where file is stored. */
    private Path absolutePath;
    /** Relative path saved in DB (portable). */
    private String relativePath;
}


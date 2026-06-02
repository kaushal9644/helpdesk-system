package com.helpdesk.dto.response;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

/**
 * Attachment metadata returned to the client.
 */
@Getter
@Builder
public class AttachmentResponse {

    private Long id;
    private Long ticketId;
    private String fileName;
    private String originalFileName;
    private String fileType;
    private long fileSize;
    private String filePath;
    private LocalDateTime uploadedAt;
    private UserResponse uploadedBy;
}


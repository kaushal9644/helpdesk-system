package com.helpdesk.service.impl;

import java.net.MalformedURLException;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.helpdesk.config.StorageProperties;
import com.helpdesk.dto.response.AttachmentResponse;
import com.helpdesk.entity.Attachment;
import com.helpdesk.entity.Ticket;
import com.helpdesk.entity.User;
import com.helpdesk.exception.BadRequestException;
import com.helpdesk.exception.ForbiddenException;
import com.helpdesk.exception.ResourceNotFoundException;
import com.helpdesk.mapper.DtoMapper;
import com.helpdesk.repository.AttachmentRepository;
import com.helpdesk.repository.TicketRepository;
import com.helpdesk.repository.UserRepository;
import com.helpdesk.security.UserPrincipal;
import com.helpdesk.service.AttachmentService;
import com.helpdesk.service.storage.FileStorageService;
import com.helpdesk.service.storage.StoredFile;
import com.helpdesk.util.SecurityUtils;

import lombok.RequiredArgsConstructor;


import java.nio.file.Path;


import org.springframework.core.io.Resource;


@Service
@RequiredArgsConstructor
public class AttachmentServiceImpl implements AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final StorageProperties storageProperties;

    @Override
    @Transactional
    public List<AttachmentResponse> uploadToTicket(Long ticketId, MultipartFile[] files) {
        UserPrincipal principal = requireCurrentUser();

        if (files == null || files.length == 0) {
            throw new BadRequestException("At least one file is required");
        }

        Ticket ticket = ticketRepository.findByIdWithDetails(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        TicketAccessHelper.requireTicketAccess(principal, ticket);

        User uploader = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String ticketFolder = "ticket-" + ticketId;

        // Store each file; if any fails, the transaction will roll back DB rows.
        // Files already written to disk are not automatically rolled back, but our naming is unique
        // and failures are rare; production alternative is temp + finalize pattern.
        Arrays.stream(files).forEach(file -> {
            StoredFile stored = fileStorageService.store(file, ticketFolder);
            Attachment attachment = Attachment.builder()
                    .ticket(ticket)
                    .uploadedBy(uploader)
                    .fileName(stored.getStoredFileName())
                    .originalFileName(stored.getOriginalFileName())
                    .fileType(stored.getContentType())
                    .fileSize(stored.getSize())
                    .filePath(stored.getRelativePath())
                    .build();
            attachmentRepository.save(attachment);
        });

        return attachmentRepository.findByTicketIdWithUploader(ticketId).stream()
                .map(DtoMapper::toAttachmentResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttachmentResponse> getAttachmentsByTicket(Long ticketId) {
        UserPrincipal principal = requireCurrentUser();

        Ticket ticket = ticketRepository.findByIdWithDetails(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        TicketAccessHelper.requireTicketAccess(principal, ticket);

        return attachmentRepository.findByTicketIdWithUploader(ticketId).stream()
                .map(DtoMapper::toAttachmentResponse)
                .toList();
    }





 @Override
public ResponseEntity<Resource> downloadAttachment(Long id) {

    Attachment attachment = attachmentRepository
            .findByIdWithTicketAndUploader(id)
            .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));

    UserPrincipal currentUser = requireCurrentUser();

    boolean isAdmin = currentUser.getRole().name().equals("ADMIN");

    boolean isOwner = attachment.getTicket()
            .getCreatedBy()
            .getId()
            .equals(currentUser.getId());

    if (!isAdmin && !isOwner) {
        throw new ForbiddenException("You are not allowed to access this attachment");
    }

    // Build base upload directory
    Path basePath = Paths.get(storageProperties.getUploadDir())
            .toAbsolutePath()
            .normalize();

    // Resolve full file path
    Path filePath = basePath.resolve(attachment.getFilePath()).normalize();

    try {

        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            throw new ResourceNotFoundException("File not found on disk");
        }

        // SAFE MIME handling (prevents crash like "file" issue)
        String mimeType = attachment.getFileType();

        MediaType mediaType = (mimeType != null && mimeType.contains("/"))
                ? MediaType.parseMediaType(mimeType)
                : MediaType.APPLICATION_OCTET_STREAM;

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + attachment.getOriginalFileName() + "\"")
                .body(resource);

    } catch (MalformedURLException e) {
        throw new RuntimeException("Unable to download file", e);
    }
}




    @Override
    @Transactional
    public void deleteAttachment(Long attachmentId) {
        UserPrincipal principal = requireCurrentUser();

        Attachment attachment = attachmentRepository.findByIdWithTicketAndUploader(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found with id: " + attachmentId));

        // Reuse ticket access rules: employee can only touch their own ticket; admin any.
        TicketAccessHelper.requireTicketAccess(principal, attachment.getTicket());

        // Delete DB row first; if disk delete fails, we still consider operation successful.
        attachmentRepository.delete(attachment);

        // attachment.filePath is stored relative to the configured upload root.
        fileStorageService.delete(
                java.nio.file.Paths.get(storageProperties.getUploadDir())
                        .resolve(attachment.getFilePath())
                        .toAbsolutePath()
                        .normalize());
    }

    private UserPrincipal requireCurrentUser() {
        UserPrincipal principal = SecurityUtils.getCurrentUser();
        if (principal == null) {
            throw new ForbiddenException("Authentication required");
        }
        return principal;
    }
}


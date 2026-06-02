package com.helpdesk.controller;

import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.helpdesk.dto.response.ApiResponse;
import com.helpdesk.dto.response.AttachmentResponse;
import com.helpdesk.service.AttachmentService;

import lombok.RequiredArgsConstructor;

/**
 * Ticket attachment endpoints.
 * <p>
 * Note: Only authenticated users can access these endpoints (JWT secured).
 */
@RestController
@RequestMapping("/api/attachments")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;

    /**
     * Upload one or more files for a ticket.
     *
     * POST /api/attachments/upload/{ticketId}
     * Form-data key: files (multiple)
     */
    @PostMapping(value = "/upload/{ticketId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<List<AttachmentResponse>>> upload(
            @PathVariable Long ticketId,
            @RequestParam("files") MultipartFile[] files) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(attachmentService.uploadToTicket(ticketId, files)));
    }


                        @GetMapping("/{id}/download")
            public ResponseEntity<Resource> downloadAttachment(@PathVariable Long id) {
                return attachmentService.downloadAttachment(id);
            }
    
    /**
     * List attachments for a ticket.
     */
    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<ApiResponse<List<AttachmentResponse>>> listByTicket(@PathVariable Long ticketId) {
        return ResponseEntity.ok(ApiResponse.ok(attachmentService.getAttachmentsByTicket(ticketId)));
    }

    /**
     * Delete an attachment. Also deletes the physical file on disk if present.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        attachmentService.deleteAttachment(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}


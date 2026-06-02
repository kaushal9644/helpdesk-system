package com.helpdesk.service;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;

import com.helpdesk.dto.response.AttachmentResponse;



public interface AttachmentService {

    List<AttachmentResponse> uploadToTicket(Long ticketId, MultipartFile[] files);

    List<AttachmentResponse> getAttachmentsByTicket(Long ticketId);
    ResponseEntity<Resource> downloadAttachment(Long id);

    void deleteAttachment(Long attachmentId);
}


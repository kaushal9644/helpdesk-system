package com.helpdesk.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.helpdesk.entity.Attachment;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

    List<Attachment> findByTicketIdOrderByUploadedAtDesc(Long ticketId);

    long countByTicketId(Long ticketId);

    void deleteByTicketId(Long ticketId);

    Optional<Attachment> findByFileNameAndTicketId(String fileName, Long ticketId);
}

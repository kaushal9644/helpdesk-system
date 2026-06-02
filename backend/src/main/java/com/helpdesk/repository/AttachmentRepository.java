package com.helpdesk.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.helpdesk.entity.Attachment;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

    @Query("""
            SELECT a FROM Attachment a
            JOIN FETCH a.uploadedBy
            JOIN FETCH a.ticket t
            WHERE t.id = :ticketId
            ORDER BY a.uploadedAt DESC
            """)
    List<Attachment> findByTicketIdWithUploader(@Param("ticketId") Long ticketId);

    long countByTicketId(Long ticketId);

    void deleteByTicketId(Long ticketId);

    Optional<Attachment> findByFileNameAndTicketId(String fileName, Long ticketId);

    @Query("""
            SELECT a FROM Attachment a
            JOIN FETCH a.uploadedBy
            JOIN FETCH a.ticket t
            JOIN FETCH t.createdBy
            WHERE a.id = :id
            """)
    Optional<Attachment> findByIdWithTicketAndUploader(@Param("id") Long id);
}

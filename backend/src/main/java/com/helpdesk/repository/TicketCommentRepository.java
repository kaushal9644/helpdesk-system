package com.helpdesk.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.helpdesk.entity.TicketComment;

@Repository
public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {

    @Query("""
            SELECT c FROM TicketComment c
            JOIN FETCH c.createdBy
            LEFT JOIN FETCH c.updatedBy
            WHERE c.ticket.id = :ticketId
            ORDER BY c.createdAt ASC
            """)
    List<TicketComment> findByTicketIdWithAuthors(@Param("ticketId") Long ticketId);

    long countByTicketId(Long ticketId);

    void deleteByTicketId(Long ticketId);
}

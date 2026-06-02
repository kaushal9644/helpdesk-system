package com.helpdesk.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.helpdesk.entity.Ticket;
import com.helpdesk.enums.TicketStatus;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    @EntityGraph(type = EntityGraph.EntityGraphType.FETCH, attributePaths = {
            "branch", "createdBy", "assignedTo", "updatedBy"
    })
    Page<Ticket> findAll(Pageable pageable);

    @EntityGraph(type = EntityGraph.EntityGraphType.FETCH, attributePaths = {
            "branch", "createdBy", "assignedTo", "updatedBy"
    })
    Page<Ticket> findByCreatedById(Long createdById, Pageable pageable);
        List<Ticket> findByStatusAndUpdatedAtBefore(    
                TicketStatus status,
                LocalDateTime date
                );
    @Query("""
            SELECT DISTINCT t FROM Ticket t
            JOIN FETCH t.branch
            JOIN FETCH t.createdBy
            LEFT JOIN FETCH t.assignedTo
            LEFT JOIN FETCH t.updatedBy
            WHERE t.id = :id
            """)      
    Optional<Ticket> findByIdWithDetails(@Param("id") Long id);

    long countByStatus(TicketStatus status);
}

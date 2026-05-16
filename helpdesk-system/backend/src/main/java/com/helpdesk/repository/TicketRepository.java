package com.helpdesk.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.helpdesk.entity.Ticket;
import com.helpdesk.enums.TicketStatus;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByCreatedById(Long userId);

    List<Ticket> findByAssignedToId(Long adminId);

    List<Ticket> findByBranchId(Long branchId);

    List<Ticket> findByStatus(TicketStatus status);

    List<Ticket> findByBranchIdAndStatus(Long branchId, TicketStatus status);

    long countByStatus(TicketStatus status);
}

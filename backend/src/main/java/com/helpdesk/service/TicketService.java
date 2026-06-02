package com.helpdesk.service;

import org.springframework.data.domain.Pageable;

import com.helpdesk.dto.request.AssignTicketRequest;
import com.helpdesk.dto.request.CreateTicketRequest;
import com.helpdesk.dto.request.UpdateTicketStatusRequest;
import com.helpdesk.dto.response.PageResponse;
import com.helpdesk.dto.response.TicketResponse;

public interface TicketService {

    TicketResponse createTicket(CreateTicketRequest request);

    PageResponse<TicketResponse> findAllTicketsPaged(Pageable pageable);

    PageResponse<TicketResponse> findMyTicketsPaged(Pageable pageable);

    TicketResponse getTicketById(Long ticketId);

    TicketResponse updateTicketStatus(Long ticketId, UpdateTicketStatusRequest request);

    TicketResponse assignTicket(Long ticketId, AssignTicketRequest request);
}

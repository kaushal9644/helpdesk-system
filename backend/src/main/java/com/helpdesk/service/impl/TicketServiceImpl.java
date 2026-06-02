package com.helpdesk.service.impl;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.helpdesk.dto.request.AssignTicketRequest;
import com.helpdesk.dto.request.CreateTicketRequest;
import com.helpdesk.dto.request.UpdateTicketStatusRequest;
import com.helpdesk.dto.response.CommentResponse;
import com.helpdesk.dto.response.PageResponse;
import com.helpdesk.dto.response.TicketResponse;
import com.helpdesk.entity.Branch;
import com.helpdesk.entity.Ticket;
import com.helpdesk.entity.User;
import com.helpdesk.enums.Role;
import com.helpdesk.enums.TicketStatus;
import com.helpdesk.exception.BadRequestException;
import com.helpdesk.exception.ForbiddenException;
import com.helpdesk.exception.ResourceNotFoundException;
import com.helpdesk.mapper.DtoMapper;
import com.helpdesk.repository.BranchRepository;
import com.helpdesk.repository.TicketCommentRepository;
import com.helpdesk.repository.TicketRepository;
import com.helpdesk.repository.UserRepository;
import com.helpdesk.security.UserPrincipal;
import com.helpdesk.service.TicketService;
import com.helpdesk.util.PageableUtils;
import com.helpdesk.util.SecurityUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    /** Hard cap protects the API from unusually large page sizes. */
    private static final int MAX_PAGE_SIZE = 100;

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository ticketCommentRepository;
    private final BranchRepository branchRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public TicketResponse createTicket(CreateTicketRequest request) {
        UserPrincipal currentUser = requireCurrentUser();

        Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Branch not found with id: " + request.getBranchId()));

        User creator = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Ticket ticket = Ticket.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .priority(request.getPriority())
                .status(TicketStatus.OPEN)
                .branch(branch)
                .createdBy(creator)
                .updatedBy(creator)
                .build();

        Ticket saved = ticketRepository.save(ticket);
        Ticket loaded = ticketRepository.findByIdWithDetails(saved.getId()).orElse(saved);
        return DtoMapper.toTicketResponse(loaded, null);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TicketResponse> findAllTicketsPaged(Pageable pageable) {
        TicketAccessHelper.requireAdmin(requireCurrentUser());

        Pageable safe = PageableUtils.ticketPageable(pageable, MAX_PAGE_SIZE);
        Page<Ticket> page = ticketRepository.findAll(safe);
        return toPage(page);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TicketResponse> findMyTicketsPaged(Pageable pageable) {
        UserPrincipal currentUser = requireCurrentUser();
        Pageable safe = PageableUtils.ticketPageable(pageable, MAX_PAGE_SIZE);
        Page<Ticket> page = ticketRepository.findByCreatedById(currentUser.getId(), safe);
        return toPage(page);
    }

    @Override
    @Transactional(readOnly = true)
    public TicketResponse getTicketById(Long ticketId) {
        UserPrincipal currentUser = requireCurrentUser();

        Ticket ticket = ticketRepository.findByIdWithDetails(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ticket not found with id: " + ticketId));

        TicketAccessHelper.requireTicketAccess(currentUser, ticket);

        List<CommentResponse> comments = ticketCommentRepository.findByTicketIdWithAuthors(ticketId).stream()
                .map(DtoMapper::toCommentResponse)
                .toList();

        return DtoMapper.toTicketResponse(ticket, comments);
    }

    @Override
    @Transactional
    public TicketResponse updateTicketStatus(Long ticketId, UpdateTicketStatusRequest request) {
        UserPrincipal actorPrincipal = requireCurrentUser();
        TicketAccessHelper.requireAdmin(actorPrincipal);

        Ticket ticket = findTicketOrThrow(ticketId);
        User actor = userRepository.findById(actorPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ticket.setStatus(request.getStatus());
        ticket.setUpdatedBy(actor);

        Ticket saved = ticketRepository.save(ticket);

        Ticket loaded = ticketRepository.findByIdWithDetails(saved.getId()).orElse(saved);
        List<CommentResponse> comments = loadCommentsSafely(saved.getId());
        return DtoMapper.toTicketResponse(loaded, comments);
    }

    @Override
    @Transactional
    public TicketResponse assignTicket(Long ticketId, AssignTicketRequest request) {
        UserPrincipal actorPrincipal = requireCurrentUser();
        TicketAccessHelper.requireAdmin(actorPrincipal);
        User actor = userRepository.findById(actorPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Ticket ticket = findTicketOrThrow(ticketId);

        User admin = userRepository.findById(request.getAdminId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + request.getAdminId()));

        if (admin.getRole() != Role.ADMIN) {
            throw new BadRequestException("Ticket can only be assigned to an admin user");
        }

        ticket.setAssignedTo(admin);
        ticket.setUpdatedBy(actor);

        Ticket saved = ticketRepository.save(ticket);

        Ticket loaded = ticketRepository.findByIdWithDetails(saved.getId()).orElse(saved);
        List<CommentResponse> comments = loadCommentsSafely(saved.getId());
        return DtoMapper.toTicketResponse(loaded, comments);
    }

    private List<CommentResponse> loadCommentsSafely(Long ticketId) {
        return ticketCommentRepository.findByTicketIdWithAuthors(ticketId).stream()
                .map(DtoMapper::toCommentResponse)
                .toList();
    }

    private PageResponse<TicketResponse> toPage(Page<Ticket> page) {
        List<TicketResponse> content = page.getContent().stream()
                .map(t -> DtoMapper.toTicketResponse(t, null))
                .toList();

        return PageResponse.<TicketResponse>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    private Ticket findTicketOrThrow(Long ticketId) {
        return ticketRepository.findByIdWithDetails(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ticket not found with id: " + ticketId));
    }

    private UserPrincipal requireCurrentUser() {
        UserPrincipal principal = SecurityUtils.getCurrentUser();
        if (principal == null) {
            throw new ForbiddenException("Authentication required");
        }
        return principal;
    }
}

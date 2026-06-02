package com.helpdesk.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.helpdesk.dto.request.CreateCommentRequest;
import com.helpdesk.dto.response.CommentResponse;
import com.helpdesk.entity.Ticket;
import com.helpdesk.entity.TicketComment;
import com.helpdesk.entity.User;
import com.helpdesk.exception.ForbiddenException;
import com.helpdesk.exception.ResourceNotFoundException;
import com.helpdesk.mapper.DtoMapper;
import com.helpdesk.repository.TicketCommentRepository;
import com.helpdesk.repository.TicketRepository;
import com.helpdesk.repository.UserRepository;
import com.helpdesk.security.UserPrincipal;
import com.helpdesk.service.CommentService;
import com.helpdesk.util.SecurityUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final TicketCommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CommentResponse addComment(CreateCommentRequest request) {
        UserPrincipal currentUser = requireCurrentUser();

        Ticket ticket = ticketRepository.findByIdWithDetails(request.getTicketId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ticket not found with id: " + request.getTicketId()));

        TicketAccessHelper.requireTicketAccess(currentUser, ticket);

        User author = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        TicketComment comment = TicketComment.builder()
                .comment(request.getComment().trim())
                .ticket(ticket)
                .createdBy(author)
                .build();

        TicketComment saved = commentRepository.save(comment);
        return DtoMapper.toCommentResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByTicketId(Long ticketId) {
        UserPrincipal currentUser = requireCurrentUser();

        Ticket ticket = ticketRepository.findByIdWithDetails(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ticket not found with id: " + ticketId));

        TicketAccessHelper.requireTicketAccess(currentUser, ticket);

        return commentRepository.findByTicketIdWithAuthors(ticketId).stream()
                .map(DtoMapper::toCommentResponse)
                .toList();
    }

    private UserPrincipal requireCurrentUser() {
        UserPrincipal principal = SecurityUtils.getCurrentUser();
        if (principal == null) {
            throw new ForbiddenException("Authentication required");
        }
        return principal;
    }
}

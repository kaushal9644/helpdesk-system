package com.helpdesk.service;

import java.util.List;

import com.helpdesk.dto.request.CreateCommentRequest;
import com.helpdesk.dto.response.CommentResponse;

/**
 * Ticket comment operations.
 */
public interface CommentService {

    CommentResponse addComment(CreateCommentRequest request);

    List<CommentResponse> getCommentsByTicketId(Long ticketId);
}

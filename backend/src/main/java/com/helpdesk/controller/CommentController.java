package com.helpdesk.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.helpdesk.dto.request.CreateCommentRequest;
import com.helpdesk.dto.response.ApiResponse;
import com.helpdesk.dto.response.CommentResponse;
import com.helpdesk.service.CommentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Ticket comment endpoints.
 */
@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @Valid @RequestBody CreateCommentRequest request) {
        CommentResponse response = commentService.addComment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }

    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getCommentsByTicket(
            @PathVariable Long ticketId) {
        return ResponseEntity.ok(ApiResponse.ok(commentService.getCommentsByTicketId(ticketId)));
    }
}

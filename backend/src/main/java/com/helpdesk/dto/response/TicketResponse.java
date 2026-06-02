package com.helpdesk.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.helpdesk.enums.Priority;
import com.helpdesk.enums.TicketStatus;

import lombok.Builder;
import lombok.Getter;


@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TicketResponse {

    private Long id;
    private String title;
    private String description;
    private TicketStatus status;
    private Priority priority;
    private BranchResponse branch;
    private UserResponse createdBy;
    private UserResponse assignedTo;
    private UserResponse updatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
private List<AttachmentResponse> attachments;
    /** Populated for {@code GET /api/tickets/{id}}; omitted in list endpoints. */
    private List<CommentResponse> comments;
}

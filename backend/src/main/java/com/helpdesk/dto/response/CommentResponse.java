package com.helpdesk.dto.response;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CommentResponse {

    private Long id;
    private Long ticketId;
    private String comment;
    /** Author of the comment (maps entity {@code createdBy} / legacy {@code user_id}). */
    private UserResponse createdBy;
    private UserResponse updatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

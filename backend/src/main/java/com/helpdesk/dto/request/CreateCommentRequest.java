package com.helpdesk.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateCommentRequest {

    @NotNull(message = "Ticket id is required")
    private Long ticketId;

    @NotBlank(message = "Comment text is required")
    @Size(min = 1, max = 10_000, message = "Comment must be between 1 and 10000 characters")
    private String comment;
}

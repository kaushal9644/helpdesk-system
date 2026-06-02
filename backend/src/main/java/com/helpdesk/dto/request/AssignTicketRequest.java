package com.helpdesk.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * Body for assigning a ticket to an admin user.
 */
@Getter
@Setter
public class AssignTicketRequest {

    @NotNull(message = "Admin user id is required")
    private Long adminId;
}

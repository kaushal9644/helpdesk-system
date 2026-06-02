package com.helpdesk.dto.response;

import com.helpdesk.enums.Role;

import lombok.Builder;
import lombok.Getter;

/**
 * Safe user info returned to the client (no password).
 */
@Getter
@Builder
public class UserResponse {

    private Long id;
    private String email;
    private String name;
    private Role role;
}

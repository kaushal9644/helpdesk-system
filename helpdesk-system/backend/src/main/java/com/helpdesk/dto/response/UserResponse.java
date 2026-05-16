package com.helpdesk.dto.response;

import com.helpdesk.enums.Role;
import com.helpdesk.security.UserPrincipal;

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

    public static UserResponse from(UserPrincipal principal) {
        return UserResponse.builder()
                .id(principal.getId())
                .email(principal.getEmail())
                .name(principal.getName())
                .role(principal.getRole())
                .build();
    }
}

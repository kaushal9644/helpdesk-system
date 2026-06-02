package com.helpdesk.dto.response;

import lombok.Builder;
import lombok.Getter;

/**
 * JSON body returned after successful login.
 */
@Getter
@Builder
public class LoginResponse {

    private String accessToken;
    private String tokenType;
    private long expiresInMs;
    private UserResponse user;
}

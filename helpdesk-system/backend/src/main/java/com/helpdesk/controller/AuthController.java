package com.helpdesk.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.helpdesk.dto.request.LoginRequest;
import com.helpdesk.dto.response.ApiResponse;
import com.helpdesk.dto.response.LoginResponse;
import com.helpdesk.dto.response.UserResponse;
import com.helpdesk.security.UserPrincipal;
import com.helpdesk.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Authentication REST endpoints (public login + current user profile).
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Employee or admin login. Returns JWT access token.
     * <pre>
     * POST /api/v1/auth/login
     * { "email": "admin@helpdesk.com", "password": "admin123" }
     * </pre>
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    /**
     * Returns the currently authenticated user (requires valid Bearer token).
     * Useful for verifying JWT and loading profile on frontend app start.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(UserResponse.from(principal)));
    }
}

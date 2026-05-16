package com.helpdesk.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.helpdesk.config.JwtProperties;
import com.helpdesk.dto.request.LoginRequest;
import com.helpdesk.dto.response.LoginResponse;
import com.helpdesk.dto.response.UserResponse;
import com.helpdesk.security.JwtTokenProvider;
import com.helpdesk.security.UserPrincipal;

import lombok.RequiredArgsConstructor;

/**
 * Handles login: verifies credentials and issues a JWT access token.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtProperties jwtProperties;

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail().trim().toLowerCase(),
                            request.getPassword()));

            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

            String accessToken = jwtTokenProvider.generateAccessToken(
                    principal.getId(),
                    principal.getEmail(),
                    principal.getRole(),
                    null);

            return LoginResponse.builder()
                    .accessToken(accessToken)
                    .tokenType("Bearer")
                    .expiresInMs(jwtProperties.getExpirationMs())
                    .user(UserResponse.from(principal))
                    .build();
        } catch (BadCredentialsException ex) {
            throw new BadCredentialsException("Invalid email or password");
        }
    }
}

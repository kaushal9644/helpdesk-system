package com.helpdesk.service;

import com.helpdesk.dto.request.LoginRequest;
import com.helpdesk.dto.response.LoginResponse;

/**
 * Authentication operations (login).
 */
public interface AuthService {

    LoginResponse login(LoginRequest request);
}

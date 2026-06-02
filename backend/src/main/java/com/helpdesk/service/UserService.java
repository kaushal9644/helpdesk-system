package com.helpdesk.service;

import java.util.List;

import com.helpdesk.dto.request.CreateUserRequest;
import com.helpdesk.dto.request.UpdateProfileRequest;
import com.helpdesk.dto.response.UserResponse;

/**
 * User lookup operations.
 */
public interface UserService {

    UserResponse getCurrentUser();

    List<UserResponse> getAllUsers();

    List<UserResponse> getAllAdmins();

    UserResponse getUserById(Long userId);

    UserResponse createEmployee(CreateUserRequest request);

    void deleteUser(Long userId);
    UserResponse getMyProfile();

UserResponse updateMyProfile(UpdateProfileRequest request);
}
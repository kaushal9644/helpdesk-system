package com.helpdesk.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.helpdesk.dto.response.UserResponse;
import com.helpdesk.enums.Role;
import com.helpdesk.exception.ForbiddenException;
import com.helpdesk.exception.ResourceNotFoundException;
import com.helpdesk.mapper.DtoMapper;
import com.helpdesk.repository.UserRepository;
import com.helpdesk.security.UserPrincipal;
import com.helpdesk.service.UserService;
import com.helpdesk.util.SecurityUtils;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;

import com.helpdesk.dto.request.CreateUserRequest;
import com.helpdesk.entity.User;
import org.springframework.security.core.context.SecurityContextHolder;

import com.helpdesk.dto.request.UpdateProfileRequest;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        UserPrincipal principal = requireCurrentUser();
        return DtoMapper.toUserResponse(principal);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        TicketAccessHelper.requireAdmin(requireCurrentUser());
        return userRepository.findAll().stream()
                .map(DtoMapper::toUserResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllAdmins() {
        TicketAccessHelper.requireAdmin(requireCurrentUser());
        return userRepository.findByRole(Role.ADMIN).stream()
                .map(DtoMapper::toUserResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long userId) {
        TicketAccessHelper.requireAdmin(requireCurrentUser());
        return userRepository.findById(userId)
                .map(DtoMapper::toUserResponse)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + userId));
    }


    @Override
@Transactional
public UserResponse createEmployee(CreateUserRequest request) {

    TicketAccessHelper.requireAdmin(requireCurrentUser());

    User user = User.builder()
            .name(request.getName())
            .email(request.getEmail().toLowerCase())
            .password(passwordEncoder.encode(request.getPassword()))
            .role(request.getRole())
            .build();

    User savedUser = userRepository.save(user);

    return DtoMapper.toUserResponse(savedUser);
}



@Override
public UserResponse getMyProfile() {

    String email = SecurityContextHolder
            .getContext()
            .getAuthentication()
            .getName();

    User user = userRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    return DtoMapper.toUserResponse(user);
}

@Override
public UserResponse updateMyProfile(UpdateProfileRequest request) {

    String email = SecurityContextHolder
            .getContext()
            .getAuthentication()
            .getName();

    User user = userRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    if (request.getName() != null && !request.getName().isBlank()) {
        user.setName(request.getName());
    }

    if (request.getPassword() != null && !request.getPassword().isBlank()) {
        user.setPassword(passwordEncoder.encode(request.getPassword()));
    }

    User updatedUser = userRepository.save(user);

    return DtoMapper.toUserResponse(updatedUser);
}



@Override
@Transactional
public void deleteUser(Long userId) {

    TicketAccessHelper.requireAdmin(requireCurrentUser());

    User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException(
                    "User not found"
            ));

    userRepository.delete(user);
}



    private UserPrincipal requireCurrentUser() {
        UserPrincipal principal = SecurityUtils.getCurrentUser();
        if (principal == null) {
            throw new ForbiddenException("Authentication required");
        }
        return principal;
    }
}

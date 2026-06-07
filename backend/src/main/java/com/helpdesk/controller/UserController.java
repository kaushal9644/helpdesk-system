package com.helpdesk.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.helpdesk.dto.request.CreateUserRequest;
import com.helpdesk.dto.response.ApiResponse;
import com.helpdesk.dto.response.UserResponse;
import com.helpdesk.service.UserService;

import lombok.RequiredArgsConstructor;


import org.springframework.web.bind.annotation.PutMapping;


import com.helpdesk.dto.request.UpdateProfileRequest;


/**
 * User profile and admin user listing endpoints.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getCurrentUser()));
    }

    @PutMapping("/me")
        public ResponseEntity<ApiResponse<UserResponse>> updateMyProfile(
                @RequestBody UpdateProfileRequest request) {

    return ResponseEntity.ok(
            ApiResponse.ok(userService.updateMyProfile(request))
    );
}


    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getAllUsers()));
    }

    @GetMapping("/admins")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllAdmins() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getAllAdmins()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getUserById(id)));
    }







@PostMapping
@PreAuthorize("hasAuthority('ADMIN')")
public ResponseEntity<ApiResponse<UserResponse>> createEmployee(
        @RequestBody CreateUserRequest request) {

    return ResponseEntity.ok(
            ApiResponse.ok(userService.createEmployee(request))
    );
}

@DeleteMapping("/{id}")
@PreAuthorize("hasAuthority('ADMIN')")
public ResponseEntity<ApiResponse<String>> deleteUser(
        @PathVariable Long id) {

    userService.deleteUser(id);

    return ResponseEntity.ok(
            ApiResponse.ok("User deleted successfully")
    );
}




}

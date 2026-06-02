package com.helpdesk.dto.response;

import lombok.Builder;
import lombok.Getter;

/**
 * Optional wrapper for successful API responses: { "data": ..., "message": "OK" }
 */
@Getter
@Builder
public class ApiResponse<T> {

    private T data;
    private String message;

    public static <T> ApiResponse<T> ok(T data) {
        return ApiResponse.<T>builder()
                .data(data)
                .message("OK")
                .build();
    }
}

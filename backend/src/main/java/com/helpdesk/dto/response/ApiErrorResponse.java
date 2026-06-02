package com.helpdesk.dto.response;

import java.time.Instant;

import lombok.Builder;
import lombok.Getter;

/**
 * Standard error JSON returned by the API and security entry point.
 */
@Getter
@Builder
public class ApiErrorResponse {

    private String code;
    private String message;
    private String path;
    private Instant timestamp;
}

package com.helpdesk.exception;

/**
 * Thrown for invalid business rules (HTTP 400).
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}

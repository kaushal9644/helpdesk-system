package com.helpdesk.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * Maps {@code app.cors.*} keys from {@code application.properties}.
 * Used by {@link CorsConfig} to build the CORS policy for browser clients (React).
 */
@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "app.cors")
public class CorsProperties {

    /**
     * Comma-separated origins, e.g. {@code http://localhost:5173}.
     */
    @NotBlank
    private String allowedOrigins;

    @NotBlank
    private String allowedMethods;

    @NotBlank
    private String allowedHeaders;

    private boolean allowCredentials;

    @Min(0)
    private long maxAge;
}

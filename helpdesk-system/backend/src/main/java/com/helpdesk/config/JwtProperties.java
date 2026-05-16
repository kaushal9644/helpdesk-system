package com.helpdesk.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * Maps {@code app.jwt.*} keys from {@code application.properties} to a type-safe Java object.
 * <p>
 * Spring binds these automatically because {@link com.helpdesk.HelpdeskApplication}
 * uses {@code @EnableConfigurationProperties(JwtProperties.class)}.
 */
@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {

    /**
     * Secret key for HS256 signing. Must be at least 32 characters for security.
     */
    @NotBlank
    private String secret;

    /**
     * Access token lifetime in milliseconds (default 24 hours = 86400000).
     */
    @Min(60_000)
    private long expirationMs;

    /**
     * Optional issuer claim stored inside the JWT payload.
     */
    @NotBlank
    private String issuer;
}

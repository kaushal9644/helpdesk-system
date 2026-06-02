package com.helpdesk.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * Maps {@code app.storage.*} from {@code application.properties}.
 */
@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "app.storage")
public class StorageProperties {

    /**
     * Directory for storing uploads (relative or absolute).
     * Example: {@code uploads}
     */
    @NotBlank
    private String uploadDir;
}


package com.helpdesk.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Cross-Origin Resource Sharing (CORS) configuration.
 * <p>
 * When the React app runs on {@code http://localhost:5173} and the API on
 * {@code http://localhost:8080}, browsers treat that as a cross-origin request.
 * CORS headers tell the browser that the API allows requests from the frontend origin.
 * <p>
 * This bean is referenced by {@link SecurityConfig} via
 * {@code http.cors(cors -> cors.configurationSource(corsConfigurationSource))}.
 */
@Configuration
public class CorsConfig {

    private final CorsProperties corsProperties;

    public CorsConfig(CorsProperties corsProperties) {
        this.corsProperties = corsProperties;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Parse comma-separated origins from application.properties
        List<String> origins = Arrays.stream(corsProperties.getAllowedOrigins().split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        configuration.setAllowedOrigins(origins);

        configuration.setAllowedMethods(
                Arrays.stream(corsProperties.getAllowedMethods().split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .toList());

        if ("*".equals(corsProperties.getAllowedHeaders().trim())) {
            configuration.addAllowedHeader("*");
        } else {
            configuration.setAllowedHeaders(
                    Arrays.stream(corsProperties.getAllowedHeaders().split(","))
                            .map(String::trim)
                            .filter(s -> !s.isEmpty())
                            .toList());
        }

        configuration.setAllowCredentials(corsProperties.isAllowCredentials());
        configuration.setMaxAge(corsProperties.getMaxAge());

        // Apply this CORS config to all paths
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

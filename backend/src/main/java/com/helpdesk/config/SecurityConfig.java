package com.helpdesk.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import com.helpdesk.security.JwtAuthenticationEntryPoint;
import com.helpdesk.security.JwtAuthenticationFilter;
import com.helpdesk.security.CustomUserDetailsService;

import lombok.RequiredArgsConstructor;

/**
 * Spring Security configuration for a stateless JWT-based API.
 * <p>
 * Flow:
 * <ol>
 *   <li>Public routes (login) are permitted without a token.</li>
 *   <li>All other routes require a valid JWT.</li>
 *   <li>{@link JwtAuthenticationFilter} runs before each request and validates the token.</li>
 *   <li>No HTTP session is created ({@code STATELESS}).</li>
 * </ol>
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final CorsConfigurationSource corsConfigurationSource;

    /**
     * Password hashing using BCrypt (industry standard for storing passwords).
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Connects {@link CustomUserDetailsService} + {@link PasswordEncoder} for username/password login.
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);

            provider.setPasswordEncoder(passwordEncoder());

            return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CSRF protection uses sessions/cookies; disabled for stateless JWT APIs
                .csrf(AbstractHttpConfigurer::disable)
                // Use CORS rules from CorsConfig
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                // JWT = no server-side session
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex ->
                        ex.authenticationEntryPoint(jwtAuthenticationEntryPoint))
                .authorizeHttpRequests(auth -> auth
                        // Preflight OPTIONS must succeed for CORS
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Login and health check without token
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/actuator/health").permitAll()
                        // Everything else needs Authentication in SecurityContext
                       .requestMatchers("/api/attachments/*/download").permitAll()
                        .anyRequest().authenticated())
                .authenticationProvider(authenticationProvider())
                // Run JWT filter before Spring's default username/password filter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

package com.helpdesk.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Component;

import com.helpdesk.config.JwtProperties;
import com.helpdesk.enums.Role;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Creates and validates JSON Web Tokens (JWT).
 * <p>
 * A JWT has three parts: header.payload.signature
 * The payload contains claims such as user id, role, and expiration time.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    private final JwtProperties jwtProperties;

    /**
     * Builds a signed access token after successful login.
     */
   public String generateAccessToken(Long userId, String email, Role role, Long branchId) {

    Date now = new Date();
    Date expiry = new Date(now.getTime() + jwtProperties.getExpirationMs());

    var builder = Jwts.builder()
            .setIssuer(jwtProperties.getIssuer())
            .setSubject(String.valueOf(userId))
            .claim("email", email)
            .claim("role", role.name())
            .setIssuedAt(now)
            .setExpiration(expiry);

    if (branchId != null) {
        builder.claim("branchId", branchId);
    }

    return builder
            .signWith(getSigningKey())
            .compact();
}

    /**
     * Parses and validates token signature and expiration.
     *
     * @return claims payload if valid
     * @throws io.jsonwebtoken.JwtException if invalid or expired
     */
        public Claims validateAndGetClaims(String token) {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .requireIssuer(jwtProperties.getIssuer())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        }

    public Long getUserIdFromClaims(Claims claims) {
        return Long.parseLong(claims.getSubject());
    }

    public String getEmailFromClaims(Claims claims) {
        return claims.get("email", String.class);
    }

    public Role getRoleFromClaims(Claims claims) {
        return Role.valueOf(claims.get("role", String.class));
    }

    public Long getBranchIdFromClaims(Claims claims) {
        Object branchId = claims.get("branchId");
        if (branchId == null) {
            return null;
        }
        if (branchId instanceof Integer integer) {
            return integer.longValue();
        }
        if (branchId instanceof Long longValue) {
            return longValue;
        }
        return Long.parseLong(branchId.toString());
    }

    /**
     * HMAC-SHA key derived from the configured secret string.
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}

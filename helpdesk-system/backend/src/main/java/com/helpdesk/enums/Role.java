package com.helpdesk.enums;

/**
 * User role in the helpdesk system.
 */
public enum Role {
    EMPLOYEE,
    ADMIN;

    /**
     * Spring Security authority format (e.g. {@code ROLE_ADMIN}).
     */
    public String toAuthority() {
        return "ROLE_" + name();
    }
}

package com.helpdesk.service.impl;

import com.helpdesk.entity.Ticket;
import com.helpdesk.enums.Role;
import com.helpdesk.exception.ForbiddenException;
import com.helpdesk.security.UserPrincipal;

final class TicketAccessHelper {

    private TicketAccessHelper() {
    }

    static void requireAdmin(UserPrincipal principal) {
        if (principal == null || principal.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Admin access required");
        }
    }

    /**
     * Read / comment authorization: ADMIN sees any ticket;
     * EMPLOYEE sees only tickets they submitted (creator).
     */
    static void requireTicketAccess(UserPrincipal principal, Ticket ticket) {
        if (principal == null) {
            throw new ForbiddenException("Authentication required");
        }
        if (principal.getRole() == Role.ADMIN) {
            return;
        }
        if (principal.getRole() == Role.EMPLOYEE
                && ticket.getCreatedBy().getId().equals(principal.getId())) {
            return;
        }
        throw new ForbiddenException("You are not authorized to access this ticket");
    }
}

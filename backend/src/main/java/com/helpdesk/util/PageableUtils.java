package com.helpdesk.util;

import java.util.List;
import java.util.Set;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/**
 * Drops unknown sort fields (prevents property exposure) and applies safe defaults for tickets listing.
 */
public final class PageableUtils {

    private static final Sort DEFAULT_TICKET_SORT = Sort.by(Sort.Direction.DESC, "createdAt");
    /**
     * Whitelist Spring Data paths that map to persisted {@link com.helpdesk.entity.Ticket} properties.
     */
    private static final Set<String> TICKET_ALLOWED_SORT = Set.of(
            "createdAt", "updatedAt", "title", "status", "priority", "id");

    private PageableUtils() {
    }

    public static Pageable ticketPageable(Pageable pageable, int maxSize) {
        int size = Math.min(Math.max(pageable.getPageSize(), 1), maxSize);
        int page = Math.max(pageable.getPageNumber(), 0);

        Sort sort = sanitizeSort(pageable.getSort(), TICKET_ALLOWED_SORT, DEFAULT_TICKET_SORT);
        return PageRequest.of(page, size, sort);
    }

    private static Sort sanitizeSort(Sort incoming, Set<String> allowed, Sort fallback) {
        if (incoming == null || incoming.isEmpty()) {
            return fallback;
        }
        List<Sort.Order> safe = incoming.stream()
                .filter(order -> allowed.contains(order.getProperty()))
                .map(order -> order.isDescending()
                        ? Sort.Order.desc(order.getProperty())
                        : Sort.Order.asc(order.getProperty()))
                .toList();
        return safe.isEmpty() ? fallback : Sort.by(safe);
    }
}

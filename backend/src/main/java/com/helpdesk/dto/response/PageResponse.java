package com.helpdesk.dto.response;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

/**
 * Pagination envelope independent of Spring Data Page (stable API JSON shape).
 */
@Getter
@Builder
public class PageResponse<T> {

    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;
}

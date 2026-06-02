package com.helpdesk.mapper;

import java.util.Collections;
import java.util.List;

import com.helpdesk.dto.response.AttachmentResponse;
import com.helpdesk.dto.response.BranchResponse;
import com.helpdesk.dto.response.CommentResponse;
import com.helpdesk.dto.response.TicketResponse;
import com.helpdesk.dto.response.UserResponse;
import com.helpdesk.entity.Attachment;
import com.helpdesk.entity.Branch;
import com.helpdesk.entity.Ticket;
import com.helpdesk.entity.TicketComment;
import com.helpdesk.entity.User;
import com.helpdesk.security.UserPrincipal;

public final class DtoMapper {

    private DtoMapper() {
    }

    public static UserResponse toUserResponse(User user) {
        if (user == null) {
            return null;
        }
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .build();
    }

    public static UserResponse toUserResponse(UserPrincipal principal) {
        if (principal == null) {
            return null;
        }
        return UserResponse.builder()
                .id(principal.getId())
                .email(principal.getEmail())
                .name(principal.getName())
                .role(principal.getRole())
                .build();
    }

    public static BranchResponse toBranchResponse(Branch branch) {
        if (branch == null) {
            return null;
        }
        Long createdById = branch.getCreatedBy() != null ? branch.getCreatedBy().getId() : null;
        Long updatedById = branch.getUpdatedBy() != null ? branch.getUpdatedBy().getId() : null;
        return BranchResponse.builder()
                .id(branch.getId())
                .branchName(branch.getBranchName())
                .city(branch.getCity())
                .createdAt(branch.getCreatedAt())
                .updatedAt(branch.getUpdatedAt())
                .createdById(createdById)
                .updatedById(updatedById)
                .build();
    }

    public static TicketResponse toTicketResponse(Ticket ticket) {
        return toTicketResponse(ticket, null);
    }

    public static TicketResponse toTicketResponse(Ticket ticket, List<CommentResponse> comments) {
        if (ticket == null) {
            return null;
        }
        List<CommentResponse> safeComments = comments == null ? null : Collections.unmodifiableList(comments);
        return TicketResponse.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .status(ticket.getStatus())
                .priority(ticket.getPriority())
                .branch(toBranchResponse(ticket.getBranch()))
                .createdBy(toUserResponse(ticket.getCreatedBy()))
                .assignedTo(toUserResponse(ticket.getAssignedTo()))
                .updatedBy(toUserResponse(ticket.getUpdatedBy()))
                                .attachments(
                    ticket.getAttachments()
                        .stream()
                        .map(DtoMapper::toAttachmentResponse)
                        .toList()
                )
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .comments(safeComments)
                .build();
    }

    public static CommentResponse toCommentResponse(TicketComment comment) {
        if (comment == null) {
            return null;
        }
        return CommentResponse.builder()
                .id(comment.getId())
                .ticketId(comment.getTicket().getId())
                .comment(comment.getComment())
                .createdBy(toUserResponse(comment.getCreatedBy()))
                .updatedBy(toUserResponse(comment.getUpdatedBy()))
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }

    public static AttachmentResponse toAttachmentResponse(Attachment attachment) {
        if (attachment == null) {
            return null;
        }
        return AttachmentResponse.builder()
                .id(attachment.getId())
                .ticketId(attachment.getTicket().getId())
                .fileName(attachment.getFileName())
                .originalFileName(attachment.getOriginalFileName())
                .fileType(attachment.getFileType())
                .fileSize(attachment.getFileSize())
                .filePath(attachment.getFilePath())
                .uploadedAt(attachment.getUploadedAt())
                .uploadedBy(toUserResponse(attachment.getUploadedBy()))
                .build();
    }
}

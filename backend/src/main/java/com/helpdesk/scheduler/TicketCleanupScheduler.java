package com.helpdesk.scheduler;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.helpdesk.entity.Attachment;
import com.helpdesk.entity.Ticket;
import com.helpdesk.enums.TicketStatus;
import com.helpdesk.repository.TicketRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class TicketCleanupScheduler {

    private final TicketRepository ticketRepository;
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void deleteOldResolvedTickets() {

        System.out.println("Ticket cleanup scheduler running...");
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);

        List<Ticket> oldTickets =
                ticketRepository.findByStatusAndUpdatedAtBefore(
                        TicketStatus.RESOLVED,
                        cutoffDate
                );

        for (Ticket ticket : oldTickets) {

            for (Attachment attachment : ticket.getAttachments()) {
                try {
                    Files.deleteIfExists(
                            Paths.get(attachment.getFilePath())
                    );
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            ticketRepository.delete(ticket);
        }

        System.out.println("Old resolved tickets deleted: " + oldTickets.size());
    }
}
package com.rumour.app.scheduler;

import com.rumour.app.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class MessageCleanupScheduler {

    private final MessageRepository messageRepository;

    // Runs every hour and deletes all messages older than 24 hours
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void deleteExpiredMessages() {
        messageRepository.deleteExpiredMessages(LocalDateTime.now());
        System.out.println("Expired messages cleaned up at: " + LocalDateTime.now());
    }
}
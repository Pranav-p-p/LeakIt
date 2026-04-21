package com.rumour.app.scheduler;

import com.rumour.app.repository.EmailVerificationRepository;
import com.rumour.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class UnverifiedUserCleanupScheduler {

    private final EmailVerificationRepository emailVerificationRepository;
    private final UserRepository userRepository;

    @Scheduled(cron = "0 0 * * * *") // runs every hour
    @Transactional
    public void deleteUnverifiedUsers() {
        // Find all expired, unverified tokens
        List<Long> expiredUserIds = emailVerificationRepository
                .findExpiredUnverifiedUserIds(LocalDateTime.now());

        if (!expiredUserIds.isEmpty()) {
            emailVerificationRepository.deleteByUserIds(expiredUserIds);
            userRepository.deleteAllById(expiredUserIds);
            System.out.println("Cleaned up " + expiredUserIds.size() + " unverified users.");
        }
    }
}
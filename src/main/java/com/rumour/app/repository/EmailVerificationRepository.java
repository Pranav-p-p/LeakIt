package com.rumour.app.repository;

import com.rumour.app.model.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {

    Optional<EmailVerification> findByToken(String token);

    // Find user IDs where token is expired and still not verified
    @Query("SELECT ev.user.id FROM EmailVerification ev " +
            "WHERE ev.isVerified = false AND ev.expiresAt < :now")
    List<Long> findExpiredUnverifiedUserIds(@Param("now") LocalDateTime now);

    // Delete verification records for those users
    @Modifying
    @Query("DELETE FROM EmailVerification ev WHERE ev.user.id IN :userIds")
    void deleteByUserIds(@Param("userIds") List<Long> userIds);
}
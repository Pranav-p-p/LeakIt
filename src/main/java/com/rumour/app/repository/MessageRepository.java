package com.rumour.app.repository;

import com.rumour.app.model.Group;
import com.rumour.app.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    // Get all messages in a group ordered by newest first
    List<Message> findByGroupOrderByPostedAtDesc(Group group);

    // Delete all expired messages
    @Modifying
    @Query("DELETE FROM Message m WHERE m.expiresAt < :now")
    void deleteExpiredMessages(LocalDateTime now);
}
package com.rumour.app.repository;

import com.rumour.app.model.Message;
import com.rumour.app.model.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReactionRepository extends JpaRepository<Reaction, Long> {

    int countByMessage(Message message);

    boolean existsByMessageAndReactorTokenAndEmoji(
            Message message, String reactorToken, String emoji);

    Optional<Reaction> findByMessageAndReactorTokenAndEmoji(
            Message message, String reactorToken, String emoji);

    List<Reaction> findByMessage(Message message);

    // Count each emoji type on a message
    @Query("SELECT r.emoji, COUNT(r) FROM Reaction r " +
            "WHERE r.message = :message GROUP BY r.emoji")
    List<Object[]> countEmojisByMessage(@Param("message") Message message);
}
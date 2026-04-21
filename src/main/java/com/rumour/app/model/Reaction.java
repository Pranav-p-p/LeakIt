package com.rumour.app.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reactions",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"message_id", "reactor_token", "emoji"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "message_id", nullable = false)
    private Message message;

    // Hashed user id — keeps reactor anonymous
    @Column(nullable = false)
    private String reactorToken;

    // Emoji like 😂 👀 🔥 🤯
    @Column(nullable = false)
    private String emoji;

    private LocalDateTime reactedAt;

    @PrePersist
    public void prePersist() {
        this.reactedAt = LocalDateTime.now();
    }
}
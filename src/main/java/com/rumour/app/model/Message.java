package com.rumour.app.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    // Hashed user id — never expose real identity
    @Column(nullable = false)
    private String senderToken;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    private LocalDateTime postedAt;

    private LocalDateTime expiresAt;

    @PrePersist
    public void prePersist() {
        this.postedAt = LocalDateTime.now();
        this.expiresAt = LocalDateTime.now().plusDays(1); // auto expire after 24 hours
    }
}
package com.rumour.app.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "banned_users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BannedUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "banned_by", nullable = false)
    private User bannedBy;

    private String reason;

    private LocalDateTime bannedAt;

    @PrePersist
    public void prePersist() {
        this.bannedAt = LocalDateTime.now();
    }
}
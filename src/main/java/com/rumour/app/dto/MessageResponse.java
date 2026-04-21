package com.rumour.app.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@Builder
public class MessageResponse {
    private Long id;
    private String senderToken;   // hashed — never reveals real identity
    private String content;
    private LocalDateTime postedAt;
    private LocalDateTime expiresAt;
    private int reactionCount;    // total reactions on this message
}
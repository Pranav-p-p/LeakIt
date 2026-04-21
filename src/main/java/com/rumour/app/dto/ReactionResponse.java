package com.rumour.app.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@Builder
public class ReactionResponse {
    private Long id;
    private Long messageId;
    private String reactorToken;   // anonymous — never reveals real identity
    private String emoji;
    private LocalDateTime reactedAt;
}
package com.rumour.app.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@Builder
public class ReportResponse {
    private Long id;
    private Long messageId;
    private String reason;
    private LocalDateTime reportedAt;
}
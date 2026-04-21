package com.rumour.app.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@Builder
public class NotificationResponse {
    private Long id;
    private String groupName;
    private String message;
    private boolean isRead;
    private LocalDateTime createdAt;
}
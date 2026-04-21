package com.rumour.app.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@Builder
public class GroupResponse {
    private Long id;
    private String groupName;
    private String inviteCode;
    private int memberCount;
    private LocalDateTime createdAt;
}

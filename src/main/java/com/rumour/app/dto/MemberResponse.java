package com.rumour.app.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@Builder
public class MemberResponse {
    private Long userId;
    private String role;
    private LocalDateTime joinedAt;
}

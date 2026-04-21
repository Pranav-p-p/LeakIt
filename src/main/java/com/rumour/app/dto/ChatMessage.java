package com.rumour.app.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {
    private Long groupId;
    private String senderToken;   // hashed identity
    private String content;
    private String postedAt;
}
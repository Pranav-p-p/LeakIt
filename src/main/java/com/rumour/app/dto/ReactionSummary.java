package com.rumour.app.dto;

import lombok.*;
import java.util.Map;

@Data
@AllArgsConstructor
@Builder
public class ReactionSummary {
    private Long messageId;
    private Map<String, Integer> emojiCounts;  // e.g. {"😂": 5, "👀": 3, "🔥": 1}
    private int totalReactions;
}
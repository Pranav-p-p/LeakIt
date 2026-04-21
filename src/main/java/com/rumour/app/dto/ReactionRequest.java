package com.rumour.app.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReactionRequest {

    @NotBlank(message = "Emoji is required")
    private String emoji;  // 😂 👀 🔥 🤯
}
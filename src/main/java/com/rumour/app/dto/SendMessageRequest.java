package com.rumour.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SendMessageRequest {

    @NotBlank(message = "Message content cannot be empty")
    @Size(max = 500, message = "Rumour cannot exceed 500 characters")
    private String content;
}
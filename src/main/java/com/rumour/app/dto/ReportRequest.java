package com.rumour.app.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReportRequest {

    @NotBlank(message = "Reason is required")
    private String reason;
}
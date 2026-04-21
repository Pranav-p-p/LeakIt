package com.rumour.app.dto;

import lombok.*;

@Data
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String email;
    private String message;
}

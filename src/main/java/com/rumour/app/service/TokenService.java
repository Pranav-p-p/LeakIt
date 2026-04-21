package com.rumour.app.service;

import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Service
public class TokenService {

    // Generate anonymous sender token from user id
    // Same user always gets same token in same group (consistent anonymity)
    public String generateSenderToken(Long userId, Long groupId) {
        try {
            String raw = "rumour-" + userId + "-group-" + groupId;
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));

            // Convert to hex string
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            // Return first 16 chars as the token (short enough to be readable)
            return hex.substring(0, 16);

        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error generating sender token");
        }
    }
}
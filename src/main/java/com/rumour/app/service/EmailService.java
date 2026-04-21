package com.rumour.app.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendVerificationEmail(String toEmail, String token) {
        String link = "http://localhost:8080/api/auth/verify-email?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Verify your RumourApp email");
        message.setText("Click the link to verify your account:\n" + link +
                "\n\nThis link expires in 15 minutes.");
        mailSender.send(message);
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        String link = "http://localhost:8080/api/auth/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("RumourApp Password Reset");
        message.setText("Click the link to reset your password:\n" + link +
                "\n\nThis link expires in 15 minutes.");
        mailSender.send(message);
    }
}

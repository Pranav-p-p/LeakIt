package com.rumour.app.service;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.*;
import com.sendgrid.helpers.mail.objects.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Value("${sendgrid.api.key}")
    private String sendGridApiKey;

    @Value("${sendgrid.from.email}")
    private String fromEmail;

    @Value("${sendgrid.from.name}")
    private String fromName;

    @Value("${app.base.url}")
    private String baseUrl;

    // ← THIS METHOD WAS MISSING
    private void sendEmail(String toEmail, String subject, String body) {
        Email from = new Email(fromEmail, fromName);
        Email to = new Email(toEmail);
        Content content = new Content("text/plain", body);
        Mail mail = new Mail(from, subject, to, content);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();

        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            sg.api(request);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }

    public void sendVerificationEmail(String toEmail, String token) {
        String link = baseUrl + "/api/auth/verify-email?token=" + token;
        String body = "Click the link to verify your Rumr account:\n\n" + link +
                "\n\nThis link expires in 15 minutes.\n\nRumr — Whisper anonymously.";
        sendEmail(toEmail, "Verify your Rumr account", body);
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        String link = baseUrl + "/api/auth/reset-password?token=" + token;
        String body = "Click the link to reset your Rumr password:\n\n" + link +
                "\n\nThis link expires in 15 minutes.\n\nRumr — Whisper anonymously.";
        sendEmail(toEmail, "Reset your Rumr password", body);
    }
}
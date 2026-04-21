package com.rumour.app.service;

import com.rumour.app.dto.AuthResponse;
import com.rumour.app.dto.LoginRequest;
import com.rumour.app.dto.RegisterRequest;
import com.rumour.app.model.*;
import com.rumour.app.repository.*;
import com.rumour.app.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetRepository passwordResetRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    // ─── REGISTER ────────────────────────────────────────────────────────────────
    public String register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .isVerified(false)
                .build();
        userRepository.save(user);

        // Generate email verification token
        String token = UUID.randomUUID().toString();
        EmailVerification verification = EmailVerification.builder()
                .user(user)
                .token(token)
                .isVerified(false)
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .build();
        emailVerificationRepository.save(verification);

        // Send verification email
        emailService.sendVerificationEmail(user.getEmail(), token);

        return "Registration successful! Please check your email to verify your account.";
    }

    // ─── VERIFY EMAIL ─────────────────────────────────────────────────────────────
    public String verifyEmail(String token) {
        EmailVerification verification = emailVerificationRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid verification token"));

        if (verification.isVerified()) {
            return "Email already verified";
        }
        if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification token has expired");
        }

        verification.setVerified(true);
        emailVerificationRepository.save(verification);

        User user = verification.getUser();
        user.setVerified(true);
        userRepository.save(user);

        return "Email verified successfully! You can now log in.";
    }

    // ─── LOGIN ────────────────────────────────────────────────────────────────────
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!user.isVerified()) {
            throw new RuntimeException("Please verify your email before logging in");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        // Generate tokens
        String accessToken = jwtUtil.generateToken(user.getEmail());
        String refreshToken = UUID.randomUUID().toString();

        // Save refresh token to DB
        refreshTokenRepository.deleteByUser(user); // Remove old token
        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .token(refreshToken)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
        refreshTokenRepository.save(rt);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .message("Login successful")
                .build();
    }

    // ─── REFRESH TOKEN ────────────────────────────────────────────────────────────
    public AuthResponse refreshToken(String refreshToken) {
        RefreshToken rt = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (rt.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Refresh token has expired, please log in again");
        }

        String newAccessToken = jwtUtil.generateToken(rt.getUser().getEmail());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken) // keep the same refresh token
                .message("Token refreshed")
                .build();
    }

    // ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with that email"));

        String token = UUID.randomUUID().toString();
        PasswordReset reset = PasswordReset.builder()
                .user(user)
                .token(token)
                .used(false)
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .build();
        passwordResetRepository.save(reset);

        emailService.sendPasswordResetEmail(email, token);

        return "Password reset email sent. Please check your inbox.";
    }

    // ─── RESET PASSWORD ───────────────────────────────────────────────────────────
    public String resetPassword(String token, String newPassword) {
        PasswordReset reset = passwordResetRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));

        if (reset.isUsed()) {
            throw new RuntimeException("This reset link has already been used");
        }
        if (reset.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired");
        }

        User user = reset.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        reset.setUsed(true);
        passwordResetRepository.save(reset);

        return "Password reset successful! You can now log in with your new password.";
    }
}

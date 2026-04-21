package com.rumour.app.service;

import com.rumour.app.dto.ReportRequest;
import com.rumour.app.dto.ReportResponse;
import com.rumour.app.model.*;
import com.rumour.app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final MessageRepository messageRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // ─── REPORT A MESSAGE ─────────────────────────────────────────────────────────
    @Transactional
    public String reportMessage(Long messageId, ReportRequest request, String email) {
        User user = getUserByEmail(email);
        Message message = getMessageById(messageId);
        Group group = message.getGroup();

        // Only group members can report
        if (!groupMemberRepository.existsByGroupAndUser(group, user)) {
            throw new RuntimeException("You are not a member of this group");
        }

        // Prevent duplicate reports from same user
        if (reportRepository.existsByMessageAndReportedBy(message, user)) {
            throw new RuntimeException("You have already reported this message");
        }

        Report report = Report.builder()
                .message(message)
                .reportedBy(user)
                .reason(request.getReason())
                .build();
        reportRepository.save(report);

        // Auto delete message if it gets 5 or more reports
        int reportCount = reportRepository.findByMessage(message).size();
        if (reportCount >= 5) {
            messageRepository.delete(message);
            return "Message has been removed due to multiple reports.";
        }

        return "Message reported successfully. Our team will review it.";
    }

    // ─── GET ALL REPORTS (admin use) ─────────────────────────────────────────────
    public List<ReportResponse> getAllReports() {
        return reportRepository.findAll()
                .stream()
                .map(r -> ReportResponse.builder()
                        .id(r.getId())
                        .messageId(r.getMessage().getId())
                        .reason(r.getReason())
                        .reportedAt(r.getReportedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // ─── HELPERS ─────────────────────────────────────────────────────────────────
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Message getMessageById(Long messageId) {
        return messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
    }
}
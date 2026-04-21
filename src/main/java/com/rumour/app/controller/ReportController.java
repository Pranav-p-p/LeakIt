package com.rumour.app.controller;

import com.rumour.app.dto.ReportRequest;
import com.rumour.app.dto.ReportResponse;
import com.rumour.app.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    // Report a message
    @PostMapping("/{messageId}")
    public ResponseEntity<String> reportMessage(
            @PathVariable Long messageId,
            @Valid @RequestBody ReportRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                reportService.reportMessage(messageId, request, userDetails.getUsername()));
    }

    // Get all reports (for admin dashboard)
    @GetMapping
    public ResponseEntity<List<ReportResponse>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }
}
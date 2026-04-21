package com.rumour.app.controller;

import com.rumour.app.dto.ReactionResponse;
import com.rumour.app.dto.ReactionSummary;
import com.rumour.app.service.ReactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reactions")
@RequiredArgsConstructor
public class ReactionController {

    private final ReactionService reactionService;

    // Toggle reaction on a message (add or remove)
    @PostMapping("/{messageId}/toggle")
    public ResponseEntity<String> toggleReaction(
            @PathVariable Long messageId,
            @RequestParam String emoji,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                reactionService.toggleReaction(messageId, emoji, userDetails.getUsername()));
    }

    // Get emoji summary for a message (e.g. 😂: 5, 👀: 3)
    @GetMapping("/{messageId}/summary")
    public ResponseEntity<ReactionSummary> getReactionSummary(
            @PathVariable Long messageId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                reactionService.getReactionSummary(messageId, userDetails.getUsername()));
    }

    // Get all individual reactions on a message
    @GetMapping("/{messageId}")
    public ResponseEntity<List<ReactionResponse>> getReactions(
            @PathVariable Long messageId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                reactionService.getReactions(messageId, userDetails.getUsername()));
    }
}
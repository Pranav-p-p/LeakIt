package com.rumour.app.controller;

import com.rumour.app.dto.MessageResponse;
import com.rumour.app.dto.SendMessageRequest;
import com.rumour.app.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    // Post a rumour to a group
    @PostMapping("/{groupId}")
    public ResponseEntity<MessageResponse> postMessage(
            @PathVariable Long groupId,
            @Valid @RequestBody SendMessageRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                messageService.postMessage(groupId, request, userDetails.getUsername()));
    }

    // Get all rumours in a group
    @GetMapping("/{groupId}")
    public ResponseEntity<List<MessageResponse>> getMessages(
            @PathVariable Long groupId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                messageService.getMessages(groupId, userDetails.getUsername()));
    }

    // Delete a specific message
    @DeleteMapping("/{groupId}/{messageId}")
    public ResponseEntity<String> deleteMessage(
            @PathVariable Long groupId,
            @PathVariable Long messageId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                messageService.deleteMessage(groupId, messageId, userDetails.getUsername()));
    }
}
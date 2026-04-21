package com.rumour.app.controller;

import com.rumour.app.dto.ChatMessage;
import com.rumour.app.dto.SendMessageRequest;
import com.rumour.app.service.MessageService;
import com.rumour.app.service.TokenService;
import com.rumour.app.repository.UserRepository;
import com.rumour.app.repository.GroupMemberRepository;
import com.rumour.app.model.User;
import com.rumour.app.model.Group;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.security.Principal;
import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final MessageService messageService;
    private final TokenService tokenService;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // Frontend sends to /app/chat/{groupId}
    // Everyone in /topic/group/{groupId} receives it
    @MessageMapping("/chat/{groupId}")
    public void sendMessage(@DestinationVariable Long groupId,
                            @Payload SendMessageRequest request,
                            Principal principal) {

        String email = principal.getName();

        // Save to DB
        messageService.postMessage(groupId, request, email);

        // Get anonymous token for this user in this group
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String senderToken = tokenService.generateSenderToken(user.getId(), groupId);

        // Build anonymous chat message
        ChatMessage chatMessage = ChatMessage.builder()
                .groupId(groupId)
                .senderToken(senderToken)
                .content(request.getContent())
                .postedAt(LocalDateTime.now().toString())
                .build();

        // Broadcast to all members in the group
        messagingTemplate.convertAndSend("/topic/group/" + groupId, chatMessage);
    }
}
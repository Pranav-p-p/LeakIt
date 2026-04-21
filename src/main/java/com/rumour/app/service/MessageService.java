package com.rumour.app.service;

import com.rumour.app.dto.MessageResponse;
import com.rumour.app.dto.SendMessageRequest;
import com.rumour.app.model.*;
import com.rumour.app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final ReactionRepository reactionRepository;
    private final TokenService tokenService;
    private final NotificationService notificationService;
    // ─── POST RUMOUR ──────────────────────────────────────────────────────────────
    @Transactional
    public MessageResponse postMessage(Long groupId,
                                       SendMessageRequest request,
                                       String email) {
        User user = getUserByEmail(email);
        Group group = getGroupById(groupId);

        if (!groupMemberRepository.existsByGroupAndUser(group, user)) {
            throw new RuntimeException("You are not a member of this group");
        }

        String senderToken = tokenService.generateSenderToken(user.getId(), groupId);

        Message message = Message.builder()
                .group(group)
                .senderToken(senderToken)
                .content(request.getContent())
                .build();
        messageRepository.save(message);

        // ← ADD THIS — notify all group members of new rumour
        notificationService.notifyGroupMembers(group,
                "New rumour posted in " + group.getGroupName() + "! 👀");

        return buildMessageResponse(message);
    }

    // ─── GET ALL RUMOURS IN A GROUP ───────────────────────────────────────────────
    public List<MessageResponse> getMessages(Long groupId, String email) {
        User user = getUserByEmail(email);
        Group group = getGroupById(groupId);

        // Only members can read messages
        if (!groupMemberRepository.existsByGroupAndUser(group, user)) {
            throw new RuntimeException("You are not a member of this group");
        }

        return messageRepository.findByGroupOrderByPostedAtDesc(group)
                .stream()
                .map(this::buildMessageResponse)
                .collect(Collectors.toList());
    }

    // ─── DELETE A SPECIFIC MESSAGE (admin only) ───────────────────────────────────
    @Transactional
    public String deleteMessage(Long groupId, Long messageId, String email) {
        User user = getUserByEmail(email);
        Group group = getGroupById(groupId);

        // Check if user is the sender or an admin
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        String userToken = tokenService.generateSenderToken(user.getId(), groupId);
        boolean isSender = message.getSenderToken().equals(userToken);
        boolean isAdmin = isGroupAdmin(group, user);

        if (!isSender && !isAdmin) {
            throw new RuntimeException("You can only delete your own messages");
        }

        messageRepository.delete(message);
        return "Message deleted successfully";
    }

    // ─── HELPERS ─────────────────────────────────────────────────────────────────
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Group getGroupById(Long groupId) {
        return groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
    }

    private boolean isGroupAdmin(Group group, User user) {
        // reuse logic — check group_roles table
        return groupMemberRepository.existsByGroupAndUser(group, user);
    }

    private MessageResponse buildMessageResponse(Message message) {
        int reactionCount = reactionRepository.countByMessage(message);
        return MessageResponse.builder()
                .id(message.getId())
                .senderToken(message.getSenderToken())
                .content(message.getContent())
                .postedAt(message.getPostedAt())
                .expiresAt(message.getExpiresAt())
                .reactionCount(reactionCount)
                .build();
    }
}
package com.rumour.app.service;

import com.rumour.app.dto.NotificationResponse;
import com.rumour.app.model.*;
import com.rumour.app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    // ─── SEND NOTIFICATION TO ALL GROUP MEMBERS ───────────────────────────────────
    // Called internally when a new rumour is posted
    @Transactional
    public void notifyGroupMembers(Group group, String messageText) {
        List<GroupMember> members = groupMemberRepository.findByGroup(group);

        for (GroupMember member : members) {
            Notification notification = Notification.builder()
                    .user(member.getUser())
                    .group(group)
                    .message(messageText)
                    .isRead(false)
                    .build();
            notificationRepository.save(notification);
        }
    }

    // ─── GET MY NOTIFICATIONS ─────────────────────────────────────────────────────
    public List<NotificationResponse> getMyNotifications(String email) {
        User user = getUserByEmail(email);
        return notificationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(n -> NotificationResponse.builder()
                        .id(n.getId())
                        .groupName(n.getGroup().getGroupName())
                        .message(n.getMessage())
                        .isRead(n.isRead())
                        .createdAt(n.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // ─── GET UNREAD NOTIFICATIONS ─────────────────────────────────────────────────
    public List<NotificationResponse> getUnreadNotifications(String email) {
        User user = getUserByEmail(email);
        return notificationRepository.findByUserAndIsReadFalse(user)
                .stream()
                .map(n -> NotificationResponse.builder()
                        .id(n.getId())
                        .groupName(n.getGroup().getGroupName())
                        .message(n.getMessage())
                        .isRead(n.isRead())
                        .createdAt(n.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // ─── MARK ALL AS READ ─────────────────────────────────────────────────────────
    @Transactional
    public String markAllAsRead(String email) {
        User user = getUserByEmail(email);
        notificationRepository.markAllAsRead(user);
        return "All notifications marked as read";
    }

    // ─── HELPERS ─────────────────────────────────────────────────────────────────
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
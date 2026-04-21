package com.rumour.app.service;

import com.rumour.app.dto.ReactionResponse;
import com.rumour.app.dto.ReactionSummary;
import com.rumour.app.model.*;
import com.rumour.app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReactionService {

    private final ReactionRepository reactionRepository;
    private final MessageRepository messageRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final TokenService tokenService;

    // ─── TOGGLE REACTION ─────────────────────────────────────────────────────────
    // If reaction exists → remove it (toggle off)
    // If reaction doesn't exist → add it (toggle on)
    @Transactional
    public String toggleReaction(Long messageId, String emoji, String email) {
        User user = getUserByEmail(email);
        Message message = getMessageById(messageId);
        Group group = message.getGroup();

        // Only group members can react
        if (!groupMemberRepository.existsByGroupAndUser(group, user)) {
            throw new RuntimeException("You are not a member of this group");
        }

        // Generate anonymous reactor token
        String reactorToken = tokenService.generateSenderToken(user.getId(), group.getId());

        Optional<Reaction> existing = reactionRepository
                .findByMessageAndReactorTokenAndEmoji(message, reactorToken, emoji);

        if (existing.isPresent()) {
            // Already reacted with this emoji → remove it
            reactionRepository.delete(existing.get());
            return "Reaction removed";
        } else {
            // Not reacted yet → add it
            Reaction reaction = Reaction.builder()
                    .message(message)
                    .reactorToken(reactorToken)
                    .emoji(emoji)
                    .build();
            reactionRepository.save(reaction);
            return "Reaction added";
        }
    }

    // ─── GET REACTION SUMMARY FOR A MESSAGE ──────────────────────────────────────
    public ReactionSummary getReactionSummary(Long messageId, String email) {
        User user = getUserByEmail(email);
        Message message = getMessageById(messageId);
        Group group = message.getGroup();

        // Only group members can see reactions
        if (!groupMemberRepository.existsByGroupAndUser(group, user)) {
            throw new RuntimeException("You are not a member of this group");
        }

        // Get emoji counts from DB
        List<Object[]> results = reactionRepository.countEmojisByMessage(message);

        Map<String, Integer> emojiCounts = new HashMap<>();
        int total = 0;

        for (Object[] row : results) {
            String emoji = (String) row[0];
            int count = ((Long) row[1]).intValue();
            emojiCounts.put(emoji, count);
            total += count;
        }

        return ReactionSummary.builder()
                .messageId(messageId)
                .emojiCounts(emojiCounts)
                .totalReactions(total)
                .build();
    }

    // ─── GET ALL REACTIONS FOR A MESSAGE ─────────────────────────────────────────
    public List<ReactionResponse> getReactions(Long messageId, String email) {
        User user = getUserByEmail(email);
        Message message = getMessageById(messageId);
        Group group = message.getGroup();

        if (!groupMemberRepository.existsByGroupAndUser(group, user)) {
            throw new RuntimeException("You are not a member of this group");
        }

        return reactionRepository.findByMessage(message)
                .stream()
                .map(r -> ReactionResponse.builder()
                        .id(r.getId())
                        .messageId(messageId)
                        .reactorToken(r.getReactorToken())  // anonymous
                        .emoji(r.getEmoji())
                        .reactedAt(r.getReactedAt())
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
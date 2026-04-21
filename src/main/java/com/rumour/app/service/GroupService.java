package com.rumour.app.service;

import com.rumour.app.dto.CreateGroupRequest;
import com.rumour.app.dto.GroupResponse;
import com.rumour.app.dto.JoinGroupRequest;
import com.rumour.app.dto.MemberResponse;
import com.rumour.app.model.*;
import com.rumour.app.model.GroupRole.Role;
import com.rumour.app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupRoleRepository groupRoleRepository;
    private final BannedUserRepository bannedUserRepository;
    private final UserRepository userRepository;

    // ─── CREATE GROUP ─────────────────────────────────────────────────────────────
    @Transactional
    public GroupResponse createGroup(CreateGroupRequest request, String email) {
        User user = getUserByEmail(email);

        String inviteCode = generateUniqueInviteCode();

        Group group = Group.builder()
                .groupName(request.getGroupName())
                .inviteCode(inviteCode)
                .createdBy(user)
                .build();
        groupRepository.save(group);

        // Creator is automatically a member
        GroupMember member = GroupMember.builder()
                .group(group)
                .user(user)
                .build();
        groupMemberRepository.save(member);

        // Creator is automatically an admin
        GroupRole role = GroupRole.builder()
                .group(group)
                .user(user)
                .role(Role.ADMIN)
                .build();
        groupRoleRepository.save(role);

        return buildGroupResponse(group);
    }

    // ─── JOIN GROUP ───────────────────────────────────────────────────────────────
    @Transactional
    public GroupResponse joinGroup(JoinGroupRequest request, String email) {
        User user = getUserByEmail(email);

        Group group = groupRepository.findByInviteCode(request.getInviteCode())
                .orElseThrow(() -> new RuntimeException("Invalid invite code"));

        // Check if banned
        if (bannedUserRepository.existsByGroupAndUser(group, user)) {
            throw new RuntimeException("You are banned from this group");
        }

        // Check if already a member
        if (groupMemberRepository.existsByGroupAndUser(group, user)) {
            throw new RuntimeException("You are already a member of this group");
        }

        // Add as member
        GroupMember member = GroupMember.builder()
                .group(group)
                .user(user)
                .build();
        groupMemberRepository.save(member);

        // Assign MEMBER role
        GroupRole role = GroupRole.builder()
                .group(group)
                .user(user)
                .role(Role.MEMBER)
                .build();
        groupRoleRepository.save(role);

        return buildGroupResponse(group);
    }

    // ─── LEAVE GROUP ──────────────────────────────────────────────────────────────
    @Transactional
    public String leaveGroup(Long groupId, String email) {
        User user = getUserByEmail(email);
        Group group = getGroupById(groupId);

        // Check if the user is the admin/creator — admin cannot leave
        GroupRole userRole = groupRoleRepository.findByGroupAndUser(group, user)
                .orElseThrow(() -> new RuntimeException("You are not a member of this group"));

        if (userRole.getRole() == Role.ADMIN) {
            throw new RuntimeException(
                    "Admins cannot leave the group. Transfer admin role or delete the group.");
        }

        GroupMember member = groupMemberRepository.findByGroupAndUser(group, user)
                .orElseThrow(() -> new RuntimeException("You are not a member of this group"));

        groupMemberRepository.delete(member);
        groupRoleRepository.delete(userRole);

        return "You have left the group: " + group.getGroupName();
    }

    // ─── KICK MEMBER ─────────────────────────────────────────────────────────────
    @Transactional
    public String kickMember(Long groupId, Long targetUserId, String adminEmail) {
        User admin = getUserByEmail(adminEmail);
        Group group = getGroupById(groupId);

        // Verify requester is admin
        assertIsAdmin(group, admin);

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Admin cannot kick themselves
        if (admin.getId().equals(targetUserId)) {
            throw new RuntimeException("You cannot kick yourself");
        }

        GroupMember member = groupMemberRepository.findByGroupAndUser(group, targetUser)
                .orElseThrow(() -> new RuntimeException("This user is not a member of the group"));

        GroupRole role = groupRoleRepository.findByGroupAndUser(group, targetUser)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        groupMemberRepository.delete(member);
        groupRoleRepository.delete(role);

        return "User has been kicked from the group.";
    }

    // ─── BAN MEMBER ──────────────────────────────────────────────────────────────
    @Transactional
    public String banMember(Long groupId, Long targetUserId, String reason, String adminEmail) {
        User admin = getUserByEmail(adminEmail);
        Group group = getGroupById(groupId);

        // Verify requester is admin
        assertIsAdmin(group, admin);

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (admin.getId().equals(targetUserId)) {
            throw new RuntimeException("You cannot ban yourself");
        }

        // Check if already banned
        if (bannedUserRepository.existsByGroupAndUser(group, targetUser)) {
            throw new RuntimeException("This user is already banned");
        }

        // Kick first if still a member
        groupMemberRepository.findByGroupAndUser(group, targetUser)
                .ifPresent(groupMemberRepository::delete);
        groupRoleRepository.findByGroupAndUser(group, targetUser)
                .ifPresent(groupRoleRepository::delete);

        // Then ban
        BannedUser ban = BannedUser.builder()
                .group(group)
                .user(targetUser)
                .bannedBy(admin)
                .reason(reason)
                .build();
        bannedUserRepository.save(ban);

        return "User has been banned from the group.";
    }

    // ─── GET ALL MEMBERS ─────────────────────────────────────────────────────────
    public List<MemberResponse> getMembers(Long groupId, String email) {
        User user = getUserByEmail(email);
        Group group = getGroupById(groupId);

        // Only members can see the member list
        if (!groupMemberRepository.existsByGroupAndUser(group, user)) {
            throw new RuntimeException("You are not a member of this group");
        }

        return groupMemberRepository.findByGroup(group).stream()
                .map(member -> {
                    GroupRole role = groupRoleRepository
                            .findByGroupAndUser(group, member.getUser())
                            .orElse(null);
                    return MemberResponse.builder()
                            .userId(member.getUser().getId())
                            .role(role != null ? role.getRole().name() : "MEMBER")
                            .joinedAt(member.getJoinedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ─── GET MY GROUPS ────────────────────────────────────────────────────────────
    public List<GroupResponse> getMyGroups(String email) {
        User user = getUserByEmail(email);
        return groupMemberRepository.findByUser(user).stream()
                .map(member -> buildGroupResponse(member.getGroup()))
                .collect(Collectors.toList());
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

    private void assertIsAdmin(Group group, User user) {
        GroupRole role = groupRoleRepository.findByGroupAndUser(group, user)
                .orElseThrow(() -> new RuntimeException("You are not a member of this group"));
        if (role.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only admins can perform this action");
        }
    }

    private GroupResponse buildGroupResponse(Group group) {
        int memberCount = groupMemberRepository.findByGroup(group).size();
        return GroupResponse.builder()
                .id(group.getId())
                .groupName(group.getGroupName())
                .inviteCode(group.getInviteCode())
                .memberCount(memberCount)
                .createdAt(group.getCreatedAt())
                .build();
    }

    private String generateUniqueInviteCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        String code;
        do {
            StringBuilder sb = new StringBuilder(8);
            for (int i = 0; i < 8; i++) {
                sb.append(chars.charAt(random.nextInt(chars.length())));
            }
            code = sb.toString();
        } while (groupRepository.existsByInviteCode(code));
        return code;
    }
}
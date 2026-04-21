package com.rumour.app.controller;


import com.rumour.app.dto.CreateGroupRequest;
import com.rumour.app.dto.GroupResponse;
import com.rumour.app.dto.JoinGroupRequest;
import com.rumour.app.dto.MemberResponse;
import com.rumour.app.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @PostMapping("/create")
    public ResponseEntity<GroupResponse> createGroup(
            @Valid @RequestBody CreateGroupRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(groupService.createGroup(request, userDetails.getUsername()));
    }

    @PostMapping("/join")
    public ResponseEntity<GroupResponse> joinGroup(
            @Valid @RequestBody JoinGroupRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(groupService.joinGroup(request, userDetails.getUsername()));
    }

    @DeleteMapping("/{groupId}/leave")
    public ResponseEntity<String> leaveGroup(
            @PathVariable Long groupId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(groupService.leaveGroup(groupId, userDetails.getUsername()));
    }

    @DeleteMapping("/{groupId}/kick/{targetUserId}")
    public ResponseEntity<String> kickMember(
            @PathVariable Long groupId,
            @PathVariable Long targetUserId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                groupService.kickMember(groupId, targetUserId, userDetails.getUsername()));
    }

    @PostMapping("/{groupId}/ban/{targetUserId}")
    public ResponseEntity<String> banMember(
            @PathVariable Long groupId,
            @PathVariable Long targetUserId,
            @RequestParam(required = false) String reason,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                groupService.banMember(groupId, targetUserId, reason, userDetails.getUsername()));
    }

    @GetMapping("/{groupId}/members")
    public ResponseEntity<List<MemberResponse>> getMembers(
            @PathVariable Long groupId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(groupService.getMembers(groupId, userDetails.getUsername()));
    }

    @GetMapping("/my-groups")
    public ResponseEntity<List<GroupResponse>> getMyGroups(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(groupService.getMyGroups(userDetails.getUsername()));
    }
}
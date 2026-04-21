package com.rumour.app.repository;

import com.rumour.app.model.Group;
import com.rumour.app.model.GroupMember;
import com.rumour.app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    boolean existsByGroupAndUser(Group group, User user);
    Optional<GroupMember> findByGroupAndUser(Group group, User user);
    List<GroupMember> findByGroup(Group group);
    List<GroupMember> findByUser(User user);
}
package com.rumour.app.repository;

import com.rumour.app.model.Group;
import com.rumour.app.model.GroupRole;
import com.rumour.app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface GroupRoleRepository extends JpaRepository<GroupRole, Long> {
    Optional<GroupRole> findByGroupAndUser(Group group, User user);
}

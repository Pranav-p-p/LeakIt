package com.rumour.app.repository;

import com.rumour.app.model.BannedUser;
import com.rumour.app.model.Group;
import com.rumour.app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BannedUserRepository extends JpaRepository<BannedUser, Long> {
    boolean existsByGroupAndUser(Group group, User user);
}

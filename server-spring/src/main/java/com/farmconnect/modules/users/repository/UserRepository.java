package com.farmconnect.modules.users.repository;

import com.farmconnect.modules.users.model.Role;
import com.farmconnect.modules.users.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUserId(String userId);
    Optional<User> findByMobile(String mobile);
    Optional<User> findByGoogleId(String googleId);
    boolean existsByEmail(String email);
    boolean existsByUserId(String userId);
    boolean existsByMobile(String mobile);
    List<User> findByRole(Role role);
}

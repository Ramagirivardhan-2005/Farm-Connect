package com.farmconnect.modules.interactions.repository;

import com.farmconnect.modules.interactions.model.UserInteraction;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserInteractionRepository extends JpaRepository<UserInteraction, Long> {
    List<UserInteraction> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    List<UserInteraction> findByUserIdAndTargetTypeOrderByCreatedAtDesc(Long userId, String targetType, Pageable pageable);
    List<UserInteraction> findByUserIdAndEventTypeOrderByCreatedAtDesc(Long userId, String eventType, Pageable pageable);
}

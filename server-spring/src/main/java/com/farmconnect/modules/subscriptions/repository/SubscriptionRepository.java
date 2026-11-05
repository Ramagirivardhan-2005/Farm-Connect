package com.farmconnect.modules.subscriptions.repository;

import com.farmconnect.modules.subscriptions.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findByUserIdAndFarmerId(Long userId, Long farmerId);
    List<Subscription> findByUserIdAndIsActiveTrue(Long userId);
    List<Subscription> findByFarmerIdAndIsActiveTrue(Long farmerId);
    boolean existsByUserIdAndFarmerIdAndIsActiveTrue(Long userId, Long farmerId);
}

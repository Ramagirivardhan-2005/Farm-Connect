package com.farmconnect.modules.subscriptions.service;

import com.farmconnect.modules.subscriptions.model.Subscription;
import com.farmconnect.modules.subscriptions.repository.SubscriptionRepository;
import com.farmconnect.modules.users.model.User;
import com.farmconnect.modules.users.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    public SubscriptionService(SubscriptionRepository subscriptionRepository, UserRepository userRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Map<String, Object> toggleSubscription(Long currentUserId, Long farmerId) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        User farmer = userRepository.findById(farmerId)
                .orElseThrow(() -> new IllegalArgumentException("Farmer not found"));

        Subscription sub = subscriptionRepository.findByUserIdAndFarmerId(currentUserId, farmerId).orElse(null);
        boolean isNowSubscribed;
        if (sub == null) {
            sub = new Subscription(user, farmer);
            subscriptionRepository.save(sub);
            isNowSubscribed = true;
        } else {
            isNowSubscribed = !Boolean.TRUE.equals(sub.getIsActive());
            sub.setIsActive(isNowSubscribed);
            subscriptionRepository.save(sub);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("subscribed", isNowSubscribed);
        result.put("farmerId", farmerId);
        result.put("message", isNowSubscribed ? "Successfully subscribed to farmer channel." : "Unsubscribed from channel.");
        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMySubscriptions(Long currentUserId) {
        return subscriptionRepository.findByUserIdAndIsActiveTrue(currentUserId).stream()
                .map(sub -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("subscriptionId", sub.getId());
                    map.put("farmerId", sub.getFarmer().getId());
                    map.put("farmerUserId", sub.getFarmer().getUserId());
                    map.put("farmerName", sub.getFarmer().getUsername());
                    map.put("farmerEmail", sub.getFarmer().getEmail());
                    map.put("createdAt", sub.getCreatedAt());
                    return map;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getFarmerSubscribers(Long farmerId) {
        return subscriptionRepository.findByFarmerIdAndIsActiveTrue(farmerId).stream()
                .map(sub -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("subscriptionId", sub.getId());
                    map.put("userId", sub.getUser().getId());
                    map.put("userName", sub.getUser().getUsername());
                    map.put("userEmail", sub.getUser().getEmail());
                    map.put("subscribedAt", sub.getCreatedAt());
                    return map;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean isSubscribed(Long currentUserId, Long farmerId) {
        return subscriptionRepository.existsByUserIdAndFarmerIdAndIsActiveTrue(currentUserId, farmerId);
    }
}

package com.farmconnect.modules.promotions.service;

import com.farmconnect.modules.promotions.model.Promotion;
import com.farmconnect.modules.promotions.model.PromotionStatus;
import com.farmconnect.modules.promotions.repository.PromotionRepository;
import com.farmconnect.modules.subscriptions.model.Subscription;
import com.farmconnect.modules.subscriptions.repository.SubscriptionRepository;
import com.farmconnect.modules.users.model.User;
import com.farmconnect.modules.users.repository.UserRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final JdbcTemplate jdbcTemplate;

    public PromotionService(PromotionRepository promotionRepository,
                            UserRepository userRepository,
                            SubscriptionRepository subscriptionRepository,
                            JdbcTemplate jdbcTemplate) {
        this.promotionRepository = promotionRepository;
        this.userRepository = userRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getActivePromotionsForUser(Long currentUserId) {
        // If user logged in, only fetch active promotions from farmers they are subscribed to,
        // or all active if none specified
        List<Promotion> active = promotionRepository.findByStatus(PromotionStatus.ACTIVE);
        if (currentUserId != null) {
            Set<Long> subscribedFarmerIds = subscriptionRepository.findByUserIdAndIsActiveTrue(currentUserId)
                    .stream()
                    .map(sub -> sub.getFarmer().getId())
                    .collect(Collectors.toSet());

            if (!subscribedFarmerIds.isEmpty()) {
                active = active.stream()
                        .filter(p -> subscribedFarmerIds.contains(p.getFarmer().getId()))
                        .collect(Collectors.toList());
            }
        }

        return active.stream().map(this::mapPromotion).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getFarmerPromotions(Long farmerId) {
        return promotionRepository.findByFarmerId(farmerId).stream()
                .map(this::mapPromotion)
                .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> createPromotion(Long farmerId, Map<String, Object> req) {
        User farmer = userRepository.findById(farmerId)
                .orElseThrow(() -> new IllegalArgumentException("Farmer not found"));

        Promotion promo = new Promotion();
        promo.setPromoId("PRM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        promo.setFarmer(farmer);
        promo.setTitle((String) req.getOrDefault("title", "Special Harvest Promotion"));
        promo.setDescription((String) req.get("description"));
        promo.setBannerImageUrl((String) req.get("bannerImageUrl"));
        if (req.containsKey("discountPercent")) {
            promo.setDiscountPercent(((Number) req.get("discountPercent")).intValue());
        }
        promo.setStatus(PromotionStatus.ACTIVE);
        promo.setStartDate(Instant.now());
        promo.setCreatedAt(Instant.now());

        Promotion saved = promotionRepository.save(promo);
        return mapPromotion(saved);
    }

    @Transactional
    public Map<String, Object> updateStatus(Long farmerId, String promoId, PromotionStatus newStatus) {
        Promotion promo = promotionRepository.findByPromoId(promoId)
                .orElseThrow(() -> new IllegalArgumentException("Promotion not found with ID: " + promoId));

        if (!promo.getFarmer().getId().equals(farmerId)) {
            throw new IllegalArgumentException("You can only update your own promotions.");
        }

        promo.setStatus(newStatus);
        Promotion saved = promotionRepository.save(promo);
        return mapPromotion(saved);
    }

    @Transactional
    public void recordView(String promoId, Long userId) {
        promotionRepository.findByPromoId(promoId).ifPresent(p -> {
            jdbcTemplate.update("INSERT INTO promotion_views (promotion_id, user_id, viewed_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
                    p.getId(), userId);
        });
    }

    @Transactional
    public void recordClick(String promoId, Long userId) {
        promotionRepository.findByPromoId(promoId).ifPresent(p -> {
            jdbcTemplate.update("INSERT INTO promotion_clicks (promotion_id, user_id, clicked_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
                    p.getId(), userId);
        });
    }

    private Map<String, Object> mapPromotion(Promotion p) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", p.getId());
        map.put("promoId", p.getPromoId());
        map.put("farmerId", p.getFarmer().getId());
        map.put("farmerName", p.getFarmer().getUsername());
        map.put("title", p.getTitle());
        map.put("description", p.getDescription());
        map.put("bannerImageUrl", p.getBannerImageUrl());
        map.put("discountPercent", p.getDiscountPercent());
        map.put("status", p.getStatus().name());
        map.put("startDate", p.getStartDate());
        map.put("endDate", p.getEndDate());
        map.put("createdAt", p.getCreatedAt());
        return map;
    }
}

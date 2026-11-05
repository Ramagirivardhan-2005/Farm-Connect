package com.farmconnect.modules.recommendations.service;

import com.farmconnect.modules.addresses.model.Address;
import com.farmconnect.modules.addresses.repository.AddressRepository;
import com.farmconnect.modules.orders.model.Order;
import com.farmconnect.modules.orders.repository.OrderRepository;
import com.farmconnect.modules.products.model.Product;
import com.farmconnect.modules.products.repository.ProductRepository;
import com.farmconnect.modules.subscriptions.model.Subscription;
import com.farmconnect.modules.subscriptions.repository.SubscriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final ProductRepository productRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final OrderRepository orderRepository;
    private final AddressRepository addressRepository;

    public RecommendationService(ProductRepository productRepository,
                                 SubscriptionRepository subscriptionRepository,
                                 OrderRepository orderRepository,
                                 AddressRepository addressRepository) {
        this.productRepository = productRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.orderRepository = orderRepository;
        this.addressRepository = addressRepository;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPersonalizedRecommendations(Long currentUserId, String query, String viewedCategory) {
        List<Product> allProducts = productRepository.findByIsActiveTrue();
        if (allProducts.isEmpty()) {
            return Collections.emptyList();
        }

        Set<Long> subscribedFarmerIds = new HashSet<>();
        Set<String> pastPurchasedCategoryNames = new HashSet<>();
        String userPincode = null;

        if (currentUserId != null) {
            subscribedFarmerIds = subscriptionRepository.findByUserIdAndIsActiveTrue(currentUserId).stream()
                    .map(sub -> sub.getFarmer().getId())
                    .collect(Collectors.toSet());

            List<Order> orders = orderRepository.findByCustomerIdOrderByCreatedAtDesc(currentUserId);
            for (Order order : orders) {
                if (order.getItems() != null) {
                    order.getItems().forEach(item -> {
                        if (item.getProduct() != null && item.getProduct().getCategory() != null) {
                            pastPurchasedCategoryNames.add(item.getProduct().getCategory().getName().toLowerCase());
                        }
                    });
                }
            }

            List<Address> addresses = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(currentUserId);
            if (!addresses.isEmpty()) {
                userPincode = addresses.get(0).getPincode();
            }
        }

        String searchLower = (query != null) ? query.trim().toLowerCase() : "";
        String viewedLower = (viewedCategory != null) ? viewedCategory.trim().toLowerCase() : "";

        final Set<Long> finalSubscribedFarmerIds = subscribedFarmerIds;
        final Set<String> finalPastCategories = pastPurchasedCategoryNames;
        final String finalUserPincode = userPincode;

        List<ScoredProduct> scored = new ArrayList<>();
        for (Product p : allProducts) {
            int score = 0;
            List<String> reasons = new ArrayList<>();

            // +50 points if farmer channel subscribed
            if (p.getFarmer() != null && finalSubscribedFarmerIds.contains(p.getFarmer().getId())) {
                score += 50;
                reasons.add("Subscribed farmer");
            }

            // +30 points if query match
            if (!searchLower.isEmpty() && (p.getName().toLowerCase().contains(searchLower) ||
                    (p.getDescription() != null && p.getDescription().toLowerCase().contains(searchLower)))) {
                score += 30;
                reasons.add("Matches your search");
            }

            // +20 points if matches viewed category in current session
            if (!viewedLower.isEmpty() && p.getCategory() != null &&
                    p.getCategory().getName().toLowerCase().contains(viewedLower)) {
                score += 20;
                reasons.add("Similar to recently viewed");
            }

            // +15 points if same category as recent purchase
            if (p.getCategory() != null && finalPastCategories.contains(p.getCategory().getName().toLowerCase())) {
                score += 15;
                reasons.add("Based on past orders");
            }

            // +10 points if rating >= 4.5
            if (p.getRating() != null && p.getRating().compareTo(new BigDecimal("4.50")) >= 0) {
                score += 10;
                reasons.add("Top rated produce");
            }

            scored.add(new ScoredProduct(p, score, reasons));
        }

        // Sort descending by score
        scored.sort((a, b) -> Integer.compare(b.score, a.score));

        return scored.stream().map(sp -> {
            Map<String, Object> map = new HashMap<>();
            Product p = sp.product;
            map.put("id", p.getId());
            map.put("productId", p.getProductId());
            map.put("name", p.getName());
            map.put("description", p.getDescription());
            map.put("price", p.getPrice());
            map.put("unit", p.getUnit());
            map.put("imageUrl", p.getImageUrl());
            map.put("rating", p.getRating());
            map.put("category", p.getCategory() != null ? p.getCategory().getName() : "Produce");
            map.put("farmerName", p.getFarmer() != null ? p.getFarmer().getUsername() : "Local Farmer");
            map.put("farmerId", p.getFarmer() != null ? p.getFarmer().getId() : null);
            map.put("recommendationScore", sp.score);
            map.put("recommendationReasons", sp.reasons);
            return map;
        }).collect(Collectors.toList());
    }

    private static class ScoredProduct {
        Product product;
        int score;
        List<String> reasons;

        ScoredProduct(Product product, int score, List<String> reasons) {
            this.product = product;
            this.score = score;
            this.reasons = reasons;
        }
    }
}

package com.farmconnect.modules.interactions.service;

import com.farmconnect.modules.interactions.model.ProductLike;
import com.farmconnect.modules.interactions.model.UserInteraction;
import com.farmconnect.modules.interactions.repository.ProductLikeRepository;
import com.farmconnect.modules.interactions.repository.UserInteractionRepository;
import com.farmconnect.modules.products.model.Product;
import com.farmconnect.modules.products.repository.ProductRepository;
import com.farmconnect.modules.users.model.User;
import com.farmconnect.modules.users.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProductInteractionService {

    private final ProductRepository productRepository;
    private final ProductLikeRepository productLikeRepository;
    private final UserRepository userRepository;
    private final UserInteractionRepository userInteractionRepository;
    private final com.farmconnect.modules.content.mongo.service.ContentSocialService contentSocialService;

    public ProductInteractionService(ProductRepository productRepository,
                                     ProductLikeRepository productLikeRepository,
                                     UserRepository userRepository,
                                     UserInteractionRepository userInteractionRepository,
                                     com.farmconnect.modules.content.mongo.service.ContentSocialService contentSocialService) {
        this.productRepository = productRepository;
        this.productLikeRepository = productLikeRepository;
        this.userRepository = userRepository;
        this.userInteractionRepository = userInteractionRepository;
        this.contentSocialService = contentSocialService;
    }

    @Transactional
    public Map<String, Object> toggleProductLike(Long userId, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Optional<ProductLike> existing = productLikeRepository.findByProductIdAndUserId(productId, userId);
        boolean liked;
        if (existing.isPresent()) {
            productLikeRepository.delete(existing.get());
            product.setLikeCount(Math.max(0, product.getLikeCount() - 1));
            liked = false;
        } else {
            productLikeRepository.save(new ProductLike(product, user));
            product.setLikeCount(product.getLikeCount() + 1);
            liked = true;

            userInteractionRepository.save(new UserInteraction(
                    userId, null, "PRODUCT", productId, "PRODUCT_LIKE", null));
        }

        // Sync to MongoDB product_likes
        try {
            contentSocialService.toggleProductLike(productId, userId);
        } catch (Exception ignored) {}

        productRepository.save(product);
        Map<String, Object> res = new HashMap<>();
        res.put("liked", liked);
        res.put("likeCount", product.getLikeCount());
        return res;
    }

    @Transactional
    public void trackView(Long productId, Long userId, String sessionId) {
        productRepository.findById(productId).ifPresent(p -> {
            p.setViewCount(p.getViewCount() + 1);
            productRepository.save(p);

            userInteractionRepository.save(new UserInteraction(
                    userId, sessionId, "PRODUCT", productId, "PRODUCT_VIEW", null));

            // Sync to MongoDB user_interactions
            try {
                if (userId != null) {
                    contentSocialService.recordInteraction(userId, "PRODUCT_VIEW", String.valueOf(productId), "PRODUCT");
                }
            } catch (Exception ignored) {}
        });
    }

    @Transactional(readOnly = true)
    public boolean isProductLiked(Long userId, Long productId) {
        if (userId == null) return false;
        return productLikeRepository.existsByProductIdAndUserId(productId, userId);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRelatedProducts(Long productId) {
        Product base = productRepository.findById(productId).orElse(null);
        if (base == null) return Collections.emptyList();

        List<Product> all = productRepository.findByIsActiveTrue();
        Long categoryId = base.getCategory() != null ? base.getCategory().getId() : null;
        Long farmerId = base.getFarmer() != null ? base.getFarmer().getId() : null;

        // Rank related:
        // Same category (+50), Same farmer (+30), Rating > 4.5 (+10)
        return all.stream()
                .filter(p -> !p.getId().equals(productId))
                .sorted((a, b) -> {
                    int scoreA = 0;
                    if (categoryId != null && a.getCategory() != null && a.getCategory().getId().equals(categoryId)) scoreA += 50;
                    if (farmerId != null && a.getFarmer() != null && a.getFarmer().getId().equals(farmerId)) scoreA += 30;
                    scoreA += (a.getRating() != null ? a.getRating().doubleValue() * 5 : 20);

                    int scoreB = 0;
                    if (categoryId != null && b.getCategory() != null && b.getCategory().getId().equals(categoryId)) scoreB += 50;
                    if (farmerId != null && b.getFarmer() != null && b.getFarmer().getId().equals(farmerId)) scoreB += 30;
                    scoreB += (b.getRating() != null ? b.getRating().doubleValue() * 5 : 20);

                    return Integer.compare(scoreB, scoreA);
                })
                .limit(6)
                .map(this::mapProductSummary)
                .collect(Collectors.toList());
    }

    private Map<String, Object> mapProductSummary(Product p) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", p.getId());
        map.put("productId", p.getProductId());
        map.put("name", p.getName());
        map.put("price", p.getPrice());
        map.put("unit", p.getUnit());
        map.put("imageUrl", p.getImageUrl());
        map.put("rating", p.getRating());
        map.put("availableQuantity", p.getAvailableQuantity());
        map.put("likeCount", p.getLikeCount());
        map.put("category", p.getCategory() != null ? p.getCategory().getName() : "Fresh Harvest");
        map.put("farmerName", p.getFarmer() != null ? p.getFarmer().getUsername() : "Local Farmer");
        map.put("farmerId", p.getFarmer() != null ? p.getFarmer().getId() : null);
        return map;
    }
}

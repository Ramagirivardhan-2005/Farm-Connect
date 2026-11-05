package com.farmconnect.modules.products.service;

import com.farmconnect.modules.channels.model.FarmerChannel;
import com.farmconnect.modules.channels.repository.FarmerChannelRepository;
import com.farmconnect.modules.products.model.*;
import com.farmconnect.modules.products.repository.*;
import com.farmconnect.modules.users.model.User;
import com.farmconnect.modules.users.repository.UserRepository;
import com.farmconnect.modules.wishlist.WishlistRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductCategoryRepository categoryRepository;
    private final FarmerChannelRepository channelRepository;
    private final UserRepository userRepository;
    private final ProductLikeRepository productLikeRepository;
    private final ProductCommentRepository productCommentRepository;
    private final ProductShareRepository productShareRepository;
    private final ProductReportRepository productReportRepository;
    private final WishlistRepository wishlistRepository;

    public ProductService(
            ProductRepository productRepository,
            ProductCategoryRepository categoryRepository,
            FarmerChannelRepository channelRepository,
            UserRepository userRepository,
            ProductLikeRepository productLikeRepository,
            ProductCommentRepository productCommentRepository,
            ProductShareRepository productShareRepository,
            ProductReportRepository productReportRepository,
            WishlistRepository wishlistRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.channelRepository = channelRepository;
        this.userRepository = userRepository;
        this.productLikeRepository = productLikeRepository;
        this.productCommentRepository = productCommentRepository;
        this.productShareRepository = productShareRepository;
        this.productReportRepository = productReportRepository;
        this.wishlistRepository = wishlistRepository;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllChannels() {
        List<FarmerChannel> channels = channelRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (FarmerChannel ch : channels) {
            List<Product> products = productRepository.findByFarmerId(ch.getFarmer().getId());
            Map<String, Object> map = new HashMap<>();
            map.put("id", ch.getId());
            map.put("channelId", ch.getChannelId());
            map.put("name", ch.getName());
            map.put("description", ch.getDescription());
            map.put("farmerName", ch.getFarmer().getUsername());
            map.put("farmerId", ch.getFarmer().getId());
            map.put("rating", 4.9);
            map.put("subscribersCount", 2840);
            map.put("defaultDeliveryFee", ch.getDefaultDeliveryFee());
            map.put("productsCount", products.size());
            map.put("products", products);
            map.put("status", ch.getStatus().name());
            result.add(map);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getChannelDetail(String channelId) {
        FarmerChannel channel = channelRepository.findByChannelId(channelId)
                .or(() -> {
                    try {
                        return channelRepository.findById(Long.parseLong(channelId));
                    } catch (NumberFormatException e) {
                        return Optional.empty();
                    }
                })
                .orElseThrow(() -> new IllegalArgumentException("Channel not found: " + channelId));

        List<Product> products = productRepository.findByFarmerId(channel.getFarmer().getId());

        Map<String, Object> map = new HashMap<>();
        map.put("channel", channel);
        map.put("products", products);
        map.put("farmer", channel.getFarmer());
        return map;
    }

    @Transactional(readOnly = true)
    public Page<Product> getProducts(int page, int size, Long categoryId) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        if (categoryId != null) {
            return productRepository.findByCategoryIdAndIsActiveTrue(categoryId, pageRequest);
        }
        return productRepository.findByIsActiveTrue(pageRequest);
    }

    @Transactional(readOnly = true)
    public List<ProductCategory> getCategories() {
        return categoryRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getProductDetailEnriched(Long id, Long currentUserId) {
        Product p = getProductById(id);

        boolean isLiked = false;
        boolean isWishlisted = false;

        if (currentUserId != null) {
            isLiked = productLikeRepository.existsByProductIdAndUserId(id, currentUserId);
            isWishlisted = wishlistRepository.existsByUserIdAndProductId(currentUserId, id);
        }

        long commentsCount = productCommentRepository.countByProductIdAndStatus(id, "ACTIVE");
        long sharesCount = productShareRepository.countByProductId(id);

        FarmerChannel channel = channelRepository.findByFarmerId(p.getFarmer().getId())
                .stream().findFirst().orElse(null);

        Map<String, Object> map = new HashMap<>();
        map.put("id", p.getId());
        map.put("productId", p.getProductId());
        map.put("name", p.getName());
        map.put("description", p.getDescription());
        map.put("price", p.getPrice());
        map.put("unit", p.getUnit());
        map.put("stockQuantity", p.getStockQuantity());
        map.put("availableQuantity", p.getAvailableQuantity());
        map.put("imageUrl", p.getImageUrl());
        map.put("rating", p.getRating());
        map.put("isActive", p.getIsActive());
        map.put("tags", p.getTags());
        map.put("category", p.getCategory());
        map.put("farmer", p.getFarmer());
        map.put("farmerName", p.getFarmer().getUsername());
        map.put("likeCount", p.getLikeCount() != null ? p.getLikeCount() : 0);
        map.put("viewCount", p.getViewCount() != null ? p.getViewCount() : 0);
        map.put("isLiked", isLiked);
        map.put("isWishlisted", isWishlisted);
        map.put("commentsCount", commentsCount);
        map.put("sharesCount", sharesCount);
        map.put("channel", channel);
        map.put("channelId", channel != null ? channel.getId() : 1);

        return map;
    }

    @Transactional
    public Product createProduct(Long farmerId, Map<String, Object> data) {
        User farmer = userRepository.findById(farmerId)
                .orElseThrow(() -> new IllegalArgumentException("Farmer user not found"));

        Product product = new Product();
        product.setFarmer(farmer);
        product.setProductId("PRD-" + (1000 + new Random().nextInt(9000)));
        product.setName((String) data.get("name"));
        product.setDescription((String) data.getOrDefault("description", ""));
        product.setPrice(new BigDecimal(data.get("price").toString()));
        product.setUnit((String) data.getOrDefault("unit", "KG"));
        product.setStockQuantity(data.get("stockQuantity") != null
                ? new BigDecimal(data.get("stockQuantity").toString())
                : new BigDecimal("100.00"));
        product.setImageUrl((String) data.get("imageUrl"));
        product.setIsActive(true);

        if (data.get("categoryId") != null) {
            categoryRepository.findById(Long.parseLong(data.get("categoryId").toString()))
                    .ifPresent(product::setCategory);
        }

        return productRepository.save(product);
    }

    // =========================================================================
    // PRODUCT INTERACTIONS (Like, Comment, Share, Report, View)
    // =========================================================================

    @Transactional
    public Map<String, Object> toggleProductLike(Long productId, Long userId) {
        Product product = getProductById(productId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        boolean alreadyLiked = productLikeRepository.existsByProductIdAndUserId(productId, userId);
        boolean likedNow;

        if (alreadyLiked) {
            productLikeRepository.deleteByProductIdAndUserId(productId, userId);
            product.setLikeCount(Math.max(0, (product.getLikeCount() != null ? product.getLikeCount() : 1) - 1));
            likedNow = false;
        } else {
            ProductLike pl = new ProductLike(product, user);
            productLikeRepository.save(pl);
            product.setLikeCount((product.getLikeCount() != null ? product.getLikeCount() : 0) + 1);
            likedNow = true;
        }

        productRepository.save(product);

        Map<String, Object> res = new HashMap<>();
        res.put("liked", likedNow);
        res.put("likeCount", product.getLikeCount());
        res.put("productId", productId);
        return res;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getComments(Long productId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ProductComment> commentsPage = productCommentRepository
                .findByProductIdAndParentCommentIsNullAndStatus(productId, "ACTIVE", pageRequest);

        List<Map<String, Object>> commentDtos = new ArrayList<>();
        for (ProductComment c : commentsPage.getContent()) {
            long repliesCount = productCommentRepository.countByParentCommentIdAndStatus(c.getId(), "ACTIVE");
            Map<String, Object> dto = toCommentDto(c);
            dto.put("repliesCount", repliesCount);
            commentDtos.add(dto);
        }

        Map<String, Object> res = new HashMap<>();
        res.put("comments", commentDtos);
        res.put("page", page);
        res.put("size", size);
        res.put("totalElements", commentsPage.getTotalElements());
        res.put("totalPages", commentsPage.getTotalPages());
        res.put("hasNext", commentsPage.hasNext());
        return res;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCommentReplies(Long commentId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
        Page<ProductComment> repliesPage = productCommentRepository
                .findByParentCommentIdAndStatus(commentId, "ACTIVE", pageRequest);

        List<Map<String, Object>> replyDtos = new ArrayList<>();
        for (ProductComment r : repliesPage.getContent()) {
            replyDtos.add(toCommentDto(r));
        }

        Map<String, Object> res = new HashMap<>();
        res.put("replies", replyDtos);
        res.put("parentCommentId", commentId);
        res.put("page", page);
        res.put("size", size);
        res.put("totalElements", repliesPage.getTotalElements());
        res.put("hasNext", repliesPage.hasNext());
        return res;
    }

    @Transactional
    public Map<String, Object> addComment(Long productId, Long userId, String text, Long parentCommentId) {
        if (text == null || text.trim().isBlank()) {
            throw new IllegalArgumentException("Comment content cannot be empty.");
        }

        Product product = getProductById(productId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ProductComment comment = new ProductComment();
        comment.setProduct(product);
        comment.setUser(user);
        comment.setComment(text.trim());
        comment.setLikeCount(0);
        comment.setStatus("ACTIVE");

        if (parentCommentId != null) {
            ProductComment parent = productCommentRepository.findById(parentCommentId)
                    .orElseThrow(() -> new IllegalArgumentException("Parent comment not found"));
            comment.setParentComment(parent);
        }

        ProductComment saved = productCommentRepository.save(comment);
        Map<String, Object> dto = toCommentDto(saved);
        dto.put("repliesCount", 0);
        return dto;
    }

    @Transactional
    public Map<String, Object> shareProduct(Long productId, Long userId, String platform) {
        Product product = getProductById(productId);
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        ProductShare share = new ProductShare(product, user, platform);
        productShareRepository.save(share);

        long totalShares = productShareRepository.countByProductId(productId);
        return Map.of("success", true, "productId", productId, "totalShares", totalShares, "platform", share.getPlatform());
    }

    @Transactional
    public Map<String, Object> reportProduct(Long productId, Long userId, String reason, String details) {
        Product product = getProductById(productId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ProductReport report = new ProductReport(product, user, reason, details);
        productReportRepository.save(report);

        return Map.of("success", true, "message", "Product report submitted for administrator review", "reportId", report.getId());
    }

    @Transactional
    public void trackView(Long productId, Long userId) {
        try {
            Product product = getProductById(productId);
            product.setViewCount((product.getViewCount() != null ? product.getViewCount() : 0) + 1);
            productRepository.save(product);
        } catch (Exception ignored) {}
    }

    private Map<String, Object> toCommentDto(ProductComment c) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", c.getId());
        dto.put("comment", c.getComment());
        dto.put("likeCount", c.getLikeCount());
        dto.put("createdAt", c.getCreatedAt());
        dto.put("userId", c.getUser().getId());
        dto.put("username", c.getUser().getUsername());
        dto.put("avatarUrl", c.getUser().getAvatarUrl());
        dto.put("parentCommentId", c.getParentComment() != null ? c.getParentComment().getId() : null);
        return dto;
    }
}

package com.farmconnect.modules.account;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.farmconnect.modules.orders.repository.OrderRepository;
import com.farmconnect.modules.products.model.Product;
import com.farmconnect.modules.products.repository.ProductRepository;
import com.farmconnect.modules.users.model.User;
import com.farmconnect.modules.users.repository.UserRepository;
import com.farmconnect.modules.wallet.model.Wallet;
import com.farmconnect.modules.wallet.repository.WalletRepository;
import com.farmconnect.modules.wishlist.WishlistItem;
import com.farmconnect.modules.wishlist.WishlistRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class AccountService {

    private final UserRepository userRepository;
    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final WalletRepository walletRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    public AccountService(
            UserRepository userRepository,
            WishlistRepository wishlistRepository,
            ProductRepository productRepository,
            WalletRepository walletRepository,
            OrderRepository orderRepository,
            PasswordEncoder passwordEncoder,
            ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.wishlistRepository = wishlistRepository;
        this.productRepository = productRepository;
        this.walletRepository = walletRepository;
        this.orderRepository = orderRepository;
        this.passwordEncoder = passwordEncoder;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Wallet wallet = walletRepository.findByUserId(userId).orElse(null);
        BigDecimal walletBalance = wallet != null ? wallet.getBalance() : BigDecimal.ZERO;
        long wishlistCount = wishlistRepository.countByUserId(userId);
        long ordersCount = orderRepository.countByCustomerId(userId);

        Map<String, Object> notificationPrefs = parseJson(user.getNotificationPrefs());
        if (notificationPrefs.isEmpty()) {
            notificationPrefs.put("emailNotifications", true);
            notificationPrefs.put("smsUpdates", true);
            notificationPrefs.put("orderAlerts", true);
            notificationPrefs.put("harvestAnnouncements", true);
            notificationPrefs.put("promoOffers", false);
        }

        Map<String, Object> privacySettings = parseJson(user.getPrivacySettings());
        if (privacySettings.isEmpty()) {
            privacySettings.put("profileVisibility", "PUBLIC");
            privacySettings.put("personalizedRecommendations", true);
            privacySettings.put("shareLocationProximity", true);
        }

        Map<String, Object> res = new HashMap<>();
        res.put("id", user.getId());
        res.put("userId", user.getUserId());
        res.put("username", user.getUsername());
        res.put("email", user.getEmail());
        res.put("mobile", user.getMobile());
        res.put("altMobile", user.getAltMobile());
        res.put("role", user.getRole().name());
        res.put("avatarUrl", user.getAvatarUrl());
        res.put("isEmailVerified", user.getIsEmailVerified());
        res.put("isMobileVerified", user.getIsMobileVerified());
        res.put("walletBalance", walletBalance);
        res.put("wishlistCount", wishlistCount);
        res.put("ordersCount", ordersCount);
        res.put("notificationPrefs", notificationPrefs);
        res.put("privacySettings", privacySettings);
        res.put("createdAt", user.getCreatedAt());

        return res;
    }

    @Transactional
    public Map<String, Object> updateProfile(Long userId, Map<String, Object> req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (req.containsKey("username") && req.get("username") != null) {
            user.setUsername(((String) req.get("username")).trim());
        }
        if (req.containsKey("mobile") && req.get("mobile") != null) {
            user.setMobile(((String) req.get("mobile")).trim());
        }
        if (req.containsKey("altMobile")) {
            user.setAltMobile(req.get("altMobile") != null ? ((String) req.get("altMobile")).trim() : null);
        }
        if (req.containsKey("avatarUrl")) {
            user.setAvatarUrl((String) req.get("avatarUrl"));
        }

        userRepository.save(user);
        return getProfile(userId);
    }

    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long.");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public Map<String, Object> updateSettings(Long userId, Map<String, Object> req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        try {
            if (req.containsKey("notificationPrefs")) {
                user.setNotificationPrefs(objectMapper.writeValueAsString(req.get("notificationPrefs")));
            }
            if (req.containsKey("privacySettings")) {
                user.setPrivacySettings(objectMapper.writeValueAsString(req.get("privacySettings")));
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize user settings", e);
        }

        userRepository.save(user);
        return getProfile(userId);
    }

    @Transactional
    public void deleteAccount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setIsActive(false);
        userRepository.save(user);
    }

    // =========================================================================
    // WISHLIST OPERATIONS (Instruction 3)
    // =========================================================================

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getWishlist(Long userId) {
        List<WishlistItem> items = wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (WishlistItem item : items) {
            Product p = item.getProduct();
            Map<String, Object> map = new HashMap<>();
            map.put("wishlistId", item.getId());
            map.put("addedAt", item.getCreatedAt());
            map.put("productId", p.getId());
            map.put("productCode", p.getProductId());
            map.put("name", p.getName());
            map.put("description", p.getDescription());
            map.put("price", p.getPrice());
            map.put("unit", p.getUnit());
            map.put("stockQuantity", p.getStockQuantity());
            map.put("availableQuantity", p.getAvailableQuantity());
            map.put("imageUrl", p.getImageUrl());
            map.put("rating", p.getRating());
            map.put("category", p.getCategory() != null ? p.getCategory().getName() : "Produce");
            map.put("farmerName", p.getFarmer() != null ? p.getFarmer().getUsername() : "Organic Farm");
            map.put("inStock", p.getAvailableQuantity() != null && p.getAvailableQuantity().compareTo(BigDecimal.ZERO) > 0);
            result.add(map);
        }

        return result;
    }

    @Transactional
    public Map<String, Object> addToWishlist(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (!wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            WishlistItem item = new WishlistItem(user, product);
            wishlistRepository.save(item);
        }

        Map<String, Object> res = new HashMap<>();
        res.put("inWishlist", true);
        res.put("wishlistCount", wishlistRepository.countByUserId(userId));
        res.put("productId", productId);
        return res;
    }

    @Transactional
    public Map<String, Object> removeFromWishlist(Long userId, Long productId) {
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);

        Map<String, Object> res = new HashMap<>();
        res.put("inWishlist", false);
        res.put("wishlistCount", wishlistRepository.countByUserId(userId));
        res.put("productId", productId);
        return res;
    }

    @Transactional(readOnly = true)
    public boolean isWishlisted(Long userId, Long productId) {
        if (userId == null || productId == null) return false;
        return wishlistRepository.existsByUserIdAndProductId(userId, productId);
    }

    private Map<String, Object> parseJson(String json) {
        if (json == null || json.isBlank()) return new HashMap<>();
        try {
            return objectMapper.readValue(json, Map.class);
        } catch (Exception e) {
            return new HashMap<>();
        }
    }
}

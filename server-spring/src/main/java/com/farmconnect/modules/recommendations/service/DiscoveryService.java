package com.farmconnect.modules.recommendations.service;

import com.farmconnect.modules.addresses.model.Address;
import com.farmconnect.modules.addresses.repository.AddressRepository;
import com.farmconnect.modules.channels.model.FarmerChannel;
import com.farmconnect.modules.channels.repository.FarmerChannelRepository;
import com.farmconnect.modules.interactions.model.ProductLike;
import com.farmconnect.modules.interactions.repository.ProductLikeRepository;
import com.farmconnect.modules.interactions.repository.UserInteractionRepository;
import com.farmconnect.modules.orders.model.Order;
import com.farmconnect.modules.orders.repository.OrderRepository;
import com.farmconnect.modules.posts.repository.PostRepository;
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
public class DiscoveryService {

    private final ProductRepository productRepository;
    private final FarmerChannelRepository farmerChannelRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final ProductLikeRepository productLikeRepository;
    private final OrderRepository orderRepository;
    private final AddressRepository addressRepository;
    private final UserInteractionRepository userInteractionRepository;
    private final PostRepository postRepository;
    private final com.farmconnect.modules.cache.service.RedisCacheService redisCacheService;
    private final com.farmconnect.modules.content.mongo.service.ContentSocialService contentSocialService;

    public DiscoveryService(ProductRepository productRepository,
                            FarmerChannelRepository farmerChannelRepository,
                            SubscriptionRepository subscriptionRepository,
                            ProductLikeRepository productLikeRepository,
                            OrderRepository orderRepository,
                            AddressRepository addressRepository,
                            UserInteractionRepository userInteractionRepository,
                            PostRepository postRepository,
                            com.farmconnect.modules.cache.service.RedisCacheService redisCacheService,
                            com.farmconnect.modules.content.mongo.service.ContentSocialService contentSocialService) {
        this.productRepository = productRepository;
        this.farmerChannelRepository = farmerChannelRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.productLikeRepository = productLikeRepository;
        this.orderRepository = orderRepository;
        this.addressRepository = addressRepository;
        this.userInteractionRepository = userInteractionRepository;
        this.postRepository = postRepository;
        this.redisCacheService = redisCacheService;
        this.contentSocialService = contentSocialService;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardDiscovery(Long currentUserId, String search, String category, Double userLat, Double userLng) {
        // Resolve user location coordinates
        double lat = userLat != null ? userLat : 18.5074;
        double lng = userLng != null ? userLng : 73.8077;

        Set<Long> likedProductIds = new HashSet<>();
        Set<Long> subscribedFarmerIds = new HashSet<>();
        Set<String> pastPurchasedCategories = new HashSet<>();

        if (currentUserId != null) {
            // Find default address coordinates if not explicitly passed
            if (userLat == null || userLng == null) {
                List<Address> addrs = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(currentUserId);
                if (!addrs.isEmpty() && addrs.get(0).getLatitude() != null) {
                    lat = addrs.get(0).getLatitude().doubleValue();
                    lng = addrs.get(0).getLongitude().doubleValue();
                }
            }

            // Liked products
            likedProductIds = productLikeRepository.findByUserId(currentUserId).stream()
                    .map(pl -> pl.getProduct().getId())
                    .collect(Collectors.toSet());

            // Subscriptions
            subscribedFarmerIds = subscriptionRepository.findByUserIdAndIsActiveTrue(currentUserId).stream()
                    .map(s -> s.getFarmer().getId())
                    .collect(Collectors.toSet());

            // Past purchases
            List<Order> orders = orderRepository.findByCustomerIdOrderByCreatedAtDesc(currentUserId);
            for (Order o : orders) {
                if (o.getItems() != null) {
                    o.getItems().forEach(item -> {
                        if (item.getProduct() != null && item.getProduct().getCategory() != null) {
                            pastPurchasedCategories.add(item.getProduct().getCategory().getName().toLowerCase());
                        }
                    });
                }
            }
        }

        final double customerLat = lat;
        final double customerLng = lng;
        final Set<Long> userLikedProducts = likedProductIds;
        final Set<Long> userSubscribedFarmers = subscribedFarmerIds;
        final Set<String> userPastCategories = pastPurchasedCategories;

        List<Product> allActiveProducts = productRepository.findByIsActiveTrue();
        List<FarmerChannel> allActiveChannels = farmerChannelRepository.findAll();

        Map<String, Object> result = new HashMap<>();

        boolean isSearch = search != null && !search.trim().isEmpty();
        result.put("isSearch", isSearch);
        result.put("query", isSearch ? search.trim() : null);

        if (isSearch) {
            String queryLower = search.trim().toLowerCase();

            // 1. Filter & Rank Products by Search Priority (Exact > Keyword > Nearby > Followed > Popular)
            List<Map<String, Object>> searchProducts = allActiveProducts.stream()
                    .filter(p -> matchesProduct(p, queryLower, category))
                    .map(p -> {
                        int score = calculateProductScore(p, queryLower, userLikedProducts, userSubscribedFarmers, userPastCategories, customerLat, customerLng);
                        double distanceKm = calculateDistance(customerLat, customerLng, getProductLat(p), getProductLng(p));
                        Map<String, Object> map = mapProduct(p, userLikedProducts.contains(p.getId()), distanceKm);
                        map.put("score", score);
                        return map;
                    })
                    .sorted((a, b) -> Integer.compare((int) b.get("score"), (int) a.get("score")))
                    .collect(Collectors.toList());

            // 2. Filter & Rank Channels by Search Priority
            List<Map<String, Object>> searchChannels = allActiveChannels.stream()
                    .filter(c -> matchesChannel(c, queryLower))
                    .map(c -> {
                        double distanceKm = calculateDistance(customerLat, customerLng,
                                c.getLatitude() != null ? c.getLatitude().doubleValue() : 18.5204,
                                c.getLongitude() != null ? c.getLongitude().doubleValue() : 73.8567);
                        int score = calculateChannelScore(c, queryLower, userSubscribedFarmers, distanceKm);
                        Map<String, Object> map = mapChannel(c, userSubscribedFarmers.contains(c.getFarmer().getId()), distanceKm);
                        map.put("score", score);
                        return map;
                    })
                    .sorted((a, b) -> Integer.compare((int) b.get("score"), (int) a.get("score")))
                    .collect(Collectors.toList());

            // 3. Related keyword suggestions
            List<String> relatedSuggestions = Arrays.asList(
                    search.trim() + " Fresh Harvest",
                    "Organic " + search.trim(),
                    search.trim() + " Daily Basket",
                    search.trim() + " Seeds & Saplings"
            );

            Map<String, Object> searchMap = new HashMap<>();
            searchMap.put("products", searchProducts);
            searchMap.put("channels", searchChannels);
            searchMap.put("relatedSuggestions", relatedSuggestions);

            // Record search event in MongoDB asynchronously
            try {
                contentSocialService.recordSearchEvent(currentUserId, search.trim(), searchProducts.size() + searchChannels.size());
            } catch (Exception ignored) {}
            result.put("searchResults", searchMap);
            result.put("products", searchProducts);
            result.put("channels", searchChannels);

        } else {
            // Category filter if present
            List<Product> filteredProducts = allActiveProducts;
            if (category != null && !category.equalsIgnoreCase("All")) {
                filteredProducts = allActiveProducts.stream()
                        .filter(p -> p.getCategory() != null && p.getCategory().getName().equalsIgnoreCase(category))
                        .collect(Collectors.toList());
            }

            // Products Section:
            // 1. Near You (Ranked by distance ascending)
            List<Map<String, Object>> nearYouProducts = filteredProducts.stream()
                    .map(p -> {
                        double dist = calculateDistance(customerLat, customerLng, getProductLat(p), getProductLng(p));
                        return mapProduct(p, userLikedProducts.contains(p.getId()), dist);
                    })
                    .sorted(Comparator.comparingDouble(a -> (double) a.get("distanceKm")))
                    .limit(10)
                    .collect(Collectors.toList());

            // 2. Recommended For You (Multi-signal scoring)
            List<Map<String, Object>> recommendedProducts = filteredProducts.stream()
                    .map(p -> {
                        double dist = calculateDistance(customerLat, customerLng, getProductLat(p), getProductLng(p));
                        int score = calculateProductScore(p, "", userLikedProducts, userSubscribedFarmers, userPastCategories, customerLat, customerLng);
                        Map<String, Object> map = mapProduct(p, userLikedProducts.contains(p.getId()), dist);
                        map.put("score", score);
                        return map;
                    })
                    .sorted((a, b) -> Integer.compare((int) b.get("score"), (int) a.get("score")))
                    .limit(12)
                    .collect(Collectors.toList());

            // 3. Popular Products (High rating & views)
            List<Map<String, Object>> popularProducts = filteredProducts.stream()
                    .sorted((a, b) -> {
                        double rateA = a.getRating() != null ? a.getRating().doubleValue() : 4.5;
                        double rateB = b.getRating() != null ? b.getRating().doubleValue() : 4.5;
                        return Double.compare(rateB, rateA);
                    })
                    .limit(8)
                    .map(p -> {
                        double dist = calculateDistance(customerLat, customerLng, getProductLat(p), getProductLng(p));
                        return mapProduct(p, userLikedProducts.contains(p.getId()), dist);
                    })
                    .collect(Collectors.toList());

            Map<String, Object> productsSection = new HashMap<>();
            productsSection.put("nearYou", nearYouProducts);
            productsSection.put("recommended", recommendedProducts);
            productsSection.put("popular", popularProducts);
            productsSection.put("all", recommendedProducts);
            result.put("productsSection", productsSection);

            // Channels Section:
            // 1. Recommended Channels (Followed > Liked > Views > Rating)
            List<Map<String, Object>> recommendedChannels = allActiveChannels.stream()
                    .map(c -> {
                        double dist = calculateDistance(customerLat, customerLng,
                                c.getLatitude() != null ? c.getLatitude().doubleValue() : 18.5204,
                                c.getLongitude() != null ? c.getLongitude().doubleValue() : 73.8567);
                        int score = calculateChannelScore(c, "", userSubscribedFarmers, dist);
                        Map<String, Object> map = mapChannel(c, userSubscribedFarmers.contains(c.getFarmer().getId()), dist);
                        map.put("score", score);
                        return map;
                    })
                    .sorted((a, b) -> Integer.compare((int) b.get("score"), (int) a.get("score")))
                    .limit(8)
                    .collect(Collectors.toList());

            // 2. Channels Near You (Sorted by distance ascending)
            List<Map<String, Object>> nearbyChannels = allActiveChannels.stream()
                    .map(c -> {
                        double dist = calculateDistance(customerLat, customerLng,
                                c.getLatitude() != null ? c.getLatitude().doubleValue() : 18.5204,
                                c.getLongitude() != null ? c.getLongitude().doubleValue() : 73.8567);
                        return mapChannel(c, userSubscribedFarmers.contains(c.getFarmer().getId()), dist);
                    })
                    .sorted(Comparator.comparingDouble(a -> (double) a.get("distanceKm")))
                    .limit(8)
                    .collect(Collectors.toList());

            Map<String, Object> channelsSection = new HashMap<>();
            channelsSection.put("recommended", recommendedChannels);
            channelsSection.put("nearYou", nearbyChannels);
            channelsSection.put("all", recommendedChannels);
            result.put("channelsSection", channelsSection);

            // Cache recommendations in Redis with 15-minute TTL
            try {
                redisCacheService.cacheUserRecommendations(currentUserId != null ? currentUserId : 0L, result);
            } catch (Exception ignored) {}
        }

        return result;
    }

    private boolean matchesProduct(Product p, String query, String category) {
        if (category != null && !category.equalsIgnoreCase("All")) {
            if (p.getCategory() == null || !p.getCategory().getName().equalsIgnoreCase(category)) {
                return false;
            }
        }
        boolean nameMatch = p.getName().toLowerCase().contains(query);
        boolean descMatch = p.getDescription() != null && p.getDescription().toLowerCase().contains(query);
        boolean tagMatch = p.getTags() != null && p.getTags().toLowerCase().contains(query);
        boolean catMatch = p.getCategory() != null && p.getCategory().getName().toLowerCase().contains(query);
        boolean farmerMatch = p.getFarmer() != null && p.getFarmer().getUsername().toLowerCase().contains(query);
        return nameMatch || descMatch || tagMatch || catMatch || farmerMatch;
    }

    private boolean matchesChannel(FarmerChannel c, String query) {
        boolean nameMatch = c.getName().toLowerCase().contains(query);
        boolean descMatch = c.getDescription() != null && c.getDescription().toLowerCase().contains(query);
        boolean farmerMatch = c.getFarmer() != null && c.getFarmer().getUsername().toLowerCase().contains(query);
        return nameMatch || descMatch || farmerMatch;
    }

    private int calculateProductScore(Product p, String query, Set<Long> liked, Set<Long> subs, Set<String> pastCats, double uLat, double uLng) {
        int score = 0;
        // Exact search match: +100
        if (!query.isEmpty() && p.getName().equalsIgnoreCase(query)) {
            score += 100;
        } else if (!query.isEmpty() && p.getName().toLowerCase().contains(query)) {
            score += 70;
        }
        // Previously purchased: +50
        if (p.getCategory() != null && pastCats.contains(p.getCategory().getName().toLowerCase())) {
            score += 50;
        }
        // Liked: +40
        if (liked.contains(p.getId())) {
            score += 40;
        }
        // Followed/Subscribed farmer: +35
        if (p.getFarmer() != null && subs.contains(p.getFarmer().getId())) {
            score += 35;
        }
        // Nearby (<= 15 km): +30
        double dist = calculateDistance(uLat, uLng, getProductLat(p), getProductLng(p));
        if (dist <= 15.0) {
            score += 30;
        } else if (dist <= 30.0) {
            score += 15;
        }
        // Same category: +20
        if (p.getCategory() != null) {
            score += 20;
        }
        // Popular: +10
        if (p.getRating() != null && p.getRating().compareTo(new BigDecimal("4.50")) >= 0) {
            score += 10;
        }
        return score;
    }

    private int calculateChannelScore(FarmerChannel c, String query, Set<Long> subs, double distanceKm) {
        int score = 0;
        // Followed/Subscribed: +100
        if (c.getFarmer() != null && subs.contains(c.getFarmer().getId())) {
            score += 100;
        }
        // Search match: +30
        if (!query.isEmpty() && c.getName().toLowerCase().contains(query)) {
            score += 30;
        }
        // Nearby: +40 (<= 15 km)
        if (distanceKm <= 15.0) {
            score += 40;
        } else if (distanceKm <= 35.0) {
            score += 20;
        }
        // Popular: +15
        if (c.getFollowerCount() != null && c.getFollowerCount() >= 2000) {
            score += 15;
        }
        return score;
    }

    // Haversine formula to compute geodesic distance in kilometers
    public static double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round((R * c) * 10.0) / 10.0; // round to 1 decimal
    }

    private double getProductLat(Product p) {
        return 18.5204; // Standard Junnar/Pune agricultural baseline
    }

    private double getProductLng(Product p) {
        return 73.8567;
    }

    private Map<String, Object> mapProduct(Product p, boolean isLiked, double distanceKm) {
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
        map.put("likeCount", p.getLikeCount());
        map.put("viewCount", p.getViewCount());
        map.put("tags", p.getTags());
        map.put("isLiked", isLiked);
        map.put("distanceKm", distanceKm);
        map.put("distanceText", distanceKm + " km away");
        map.put("category", p.getCategory() != null ? p.getCategory().getName() : "Fresh Produce");

        if (p.getFarmer() != null) {
            map.put("farmerId", p.getFarmer().getId());
            map.put("farmerName", p.getFarmer().getUsername());
            map.put("farmerAvatar", p.getFarmer().getAvatarUrl());
        }
        return map;
    }

    private Map<String, Object> mapChannel(FarmerChannel c, boolean isFollowed, double distanceKm) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", c.getId());
        map.put("channelId", c.getChannelId());
        map.put("name", c.getName());
        map.put("description", c.getDescription());
        map.put("bannerImage", c.getBannerImage());
        map.put("logoImage", c.getLogoImage());
        map.put("followerCount", c.getFollowerCount());
        map.put("likeCount", c.getLikeCount());
        map.put("isFollowed", isFollowed);
        map.put("distanceKm", distanceKm);
        map.put("distanceText", distanceKm + " km away");
        map.put("defaultDeliveryFee", c.getDefaultDeliveryFee());
        map.put("freeDeliveryThreshold", c.getFreeDeliveryThreshold());

        if (c.getFarmer() != null) {
            map.put("farmerId", c.getFarmer().getId());
            map.put("farmerName", c.getFarmer().getUsername());
            map.put("farmerAvatar", c.getFarmer().getAvatarUrl());
        }
        return map;
    }
}

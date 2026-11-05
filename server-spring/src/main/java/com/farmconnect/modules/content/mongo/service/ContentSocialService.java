package com.farmconnect.modules.content.mongo.service;

import com.farmconnect.modules.content.mongo.model.*;
import com.farmconnect.modules.content.mongo.repository.*;
import com.farmconnect.modules.channels.model.FarmerChannel;
import com.farmconnect.modules.channels.repository.FarmerChannelRepository;
import com.farmconnect.modules.products.model.Product;
import com.farmconnect.modules.products.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class ContentSocialService {

    private static final Logger log = LoggerFactory.getLogger(ContentSocialService.class);

    private final ObjectProvider<PostMongoRepository> postMongoRepositoryProvider;
    private final ObjectProvider<PostCommentMongoRepository> postCommentMongoRepositoryProvider;
    private final ObjectProvider<PostLikeMongoRepository> postLikeMongoRepositoryProvider;
    private final ObjectProvider<ProductLikeMongoRepository> productLikeMongoRepositoryProvider;
    private final ObjectProvider<UserInteractionMongoRepository> userInteractionMongoRepositoryProvider;
    private final ObjectProvider<SearchEventMongoRepository> searchEventMongoRepositoryProvider;
    private final ProductRepository productRepository;
    private final FarmerChannelRepository farmerChannelRepository;

    public ContentSocialService(
            ObjectProvider<PostMongoRepository> postMongoRepositoryProvider,
            ObjectProvider<PostCommentMongoRepository> postCommentMongoRepositoryProvider,
            ObjectProvider<PostLikeMongoRepository> postLikeMongoRepositoryProvider,
            ObjectProvider<ProductLikeMongoRepository> productLikeMongoRepositoryProvider,
            ObjectProvider<UserInteractionMongoRepository> userInteractionMongoRepositoryProvider,
            ObjectProvider<SearchEventMongoRepository> searchEventMongoRepositoryProvider,
            ProductRepository productRepository,
            FarmerChannelRepository farmerChannelRepository) {
        this.postMongoRepositoryProvider = postMongoRepositoryProvider;
        this.postCommentMongoRepositoryProvider = postCommentMongoRepositoryProvider;
        this.postLikeMongoRepositoryProvider = postLikeMongoRepositoryProvider;
        this.productLikeMongoRepositoryProvider = productLikeMongoRepositoryProvider;
        this.userInteractionMongoRepositoryProvider = userInteractionMongoRepositoryProvider;
        this.searchEventMongoRepositoryProvider = searchEventMongoRepositoryProvider;
        this.productRepository = productRepository;
        this.farmerChannelRepository = farmerChannelRepository;
    }

    /**
     * Auto-seed demo harvest posts in MongoDB on startup if collection is empty
     */
    @Async
    @EventListener(ApplicationReadyEvent.class)
    public void seedInitialPostsIfEmpty() {
        PostMongoRepository postMongoRepo = postMongoRepositoryProvider.getIfAvailable();
        PostCommentMongoRepository commentMongoRepo = postCommentMongoRepositoryProvider.getIfAvailable();

        if (postMongoRepo == null || commentMongoRepo == null) {
            log.debug("MongoDB repositories not available in this profile. Skipping auto-seeding.");
            return;
        }

        try {
            if (postMongoRepo.count() == 0) {
                log.info("MongoDB 'posts' collection is empty. Seeding demo harvest posts...");

                PostDocument post1 = new PostDocument();
                post1.setPostId("POST-101");
                post1.setChannelId(1L);
                post1.setProductId(1L);
                post1.setFarmerId(2L);
                post1.setFarmerName("Kisan Ramesh Patil");
                post1.setTitle("Dawn Harvest: Fresh Indigenous Country Tomatoes!");
                post1.setContent("Our first crate of vine-ripened indigenous country tomatoes harvested this morning at 6:00 AM. High in lycopene and naturally sweet, perfect for curries and farm salads.");
                post1.setMediaUrl("https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80");
                post1.setTags(List.of("Fresh Harvest", "Tomatoes", "Country", "Organic"));
                post1.setPrice(new BigDecimal("40.00"));
                post1.setDiscountPercent(10);
                post1.setCallToAction("Shop Now");
                post1.setLikeCount(58);
                post1.setCommentCount(2);
                post1.setViewCount(420);
                postMongoRepo.save(post1);

                PostDocument post2 = new PostDocument();
                post2.setPostId("POST-102");
                post2.setChannelId(1L);
                post2.setProductId(2L);
                post2.setFarmerId(2L);
                post2.setFarmerName("Kisan Ramesh Patil");
                post2.setTitle("Hydroponic Tender Baby Spinach is Ready!");
                post2.setContent("Crisp, root-on hydroponic baby spinach harvested in our covered greenhouse. Completely free of synthetic soil residues and rich in iron. Limited daily batch!");
                post2.setMediaUrl("https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80");
                post2.setTags(List.of("Hydroponic", "Spinach", "Greens", "Healthy"));
                post2.setPrice(new BigDecimal("30.00"));
                post2.setDiscountPercent(0);
                post2.setCallToAction("Shop Now");
                post2.setLikeCount(43);
                post2.setCommentCount(0);
                post2.setViewCount(310);
                postMongoRepo.save(post2);

                PostDocument post3 = new PostDocument();
                post3.setPostId("POST-103");
                post3.setChannelId(2L);
                post3.setProductId(3L);
                post3.setFarmerId(2L);
                post3.setFarmerName("Kisan Ramesh Patil");
                post3.setTitle("GI-Tagged Junnar Kesar Mangoes - Weekend Special Offer!");
                post3.setContent("Pre-orders now open for our tree-ripened, GI-tagged Junnar Kesar Mangoes. Ripened naturally in dry rice-hay without chemical carbides. Unbeatable aroma and sweetness.");
                post3.setMediaUrl("https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80");
                post3.setTags(List.of("Mangoes", "Kesar", "Summer Fruit", "Sweet"));
                post3.setPrice(new BigDecimal("350.00"));
                post3.setDiscountPercent(15);
                post3.setCallToAction("Shop Now");
                post3.setLikeCount(92);
                post3.setCommentCount(1);
                post3.setViewCount(850);
                postMongoRepo.save(post3);

                // Add demo comments
                PostCommentDocument c1 = new PostCommentDocument();
                c1.setPostId("POST-101");
                c1.setUserId(1L);
                c1.setUserName("Ramagiri Vardhan");
                c1.setComment("Received these yesterday morning in Kothrud! The aroma and freshness is leagues better than supermarket tomatoes.");
                commentMongoRepo.save(c1);

                PostCommentDocument c2 = new PostCommentDocument();
                c2.setPostId("POST-101");
                c2.setUserId(3L);
                c2.setUserName("Suresh Express Rider");
                c2.setComment("Confirming prompt cold-chain delivery for all Kothrud & Baner orders today!");
                commentMongoRepo.save(c2);

                log.info("MongoDB initial posts and comments successfully seeded.");
            }
        } catch (Exception e) {
            log.warn("Could not seed MongoDB posts: {}", e.getMessage());
        }
    }

    /**
     * Create Post with Anti-Spam Duplicate Detection (30-minute window)
     */
    public PostDocument createPost(
            Long farmerId, String farmerName, Long channelId, Long productId,
            String title, String content, String mediaUrl, List<String> tags,
            BigDecimal price, Integer discountPercent, String callToAction) {

        PostMongoRepository postMongoRepo = postMongoRepositoryProvider.getIfAvailable();
        if (postMongoRepo == null) {
            log.debug("MongoDB post repository not available. Skipping MongoDB post create.");
            return null;
        }

        // Anti-duplicate rule: check recent posts for the same product within 30 minutes
        if (productId != null) {
            Instant thirtyMinutesAgo = Instant.now().minus(30, ChronoUnit.MINUTES);
            List<PostDocument> recent = postMongoRepo
                    .findTop5ByFarmerIdAndProductIdAndCreatedAtAfterOrderByCreatedAtDesc(farmerId, productId, thirtyMinutesAgo);

            for (PostDocument p : recent) {
                if (p.getContent() != null && p.getContent().trim().equalsIgnoreCase(content.trim())) {
                    throw new IllegalStateException("Duplicate post detected: You have already posted this item recently. Please wait before posting again or use the repost feature.");
                }
            }
        }

        PostDocument post = new PostDocument();
        post.setPostId("POST-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        post.setFarmerId(farmerId);
        post.setFarmerName(farmerName);
        post.setChannelId(channelId);
        post.setProductId(productId);
        post.setTitle(title);
        post.setContent(content);
        post.setMediaUrl(mediaUrl);
        if (tags != null) post.setTags(tags);
        post.setPrice(price);
        post.setDiscountPercent(discountPercent != null ? discountPercent : 0);
        post.setCallToAction(callToAction != null ? callToAction : "Shop Now");
        post.setStatus("ACTIVE");

        return postMongoRepo.save(post);
    }

    /**
     * Controlled Repost
     */
    public PostDocument repost(String originalPostId, Long farmerId, String farmerName) {
        PostMongoRepository postMongoRepo = postMongoRepositoryProvider.getIfAvailable();
        if (postMongoRepo == null) return null;

        PostDocument original = postMongoRepo.findByPostId(originalPostId)
                .orElseThrow(() -> new IllegalArgumentException("Original post not found: " + originalPostId));

        PostDocument repost = new PostDocument();
        repost.setPostId("POST-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        repost.setOriginalPostId(original.getPostId());
        repost.setFarmerId(farmerId);
        repost.setFarmerName(farmerName);
        repost.setChannelId(original.getChannelId());
        repost.setProductId(original.getProductId());
        repost.setTitle(original.getTitle());
        repost.setContent(original.getContent());
        repost.setMediaUrl(original.getMediaUrl());
        repost.setTags(original.getTags());
        repost.setPrice(original.getPrice());
        repost.setDiscountPercent(original.getDiscountPercent());
        repost.setCallToAction(original.getCallToAction());
        repost.setStatus("ACTIVE");

        PostDocument saved = postMongoRepo.save(repost);

        // Increment repost count on original
        original.setRepostCount(original.getRepostCount() + 1);
        postMongoRepo.save(original);

        return saved;
    }

    /**
     * Toggle Post Like
     */
    public Map<String, Object> togglePostLike(String postId, Long userId) {
        PostMongoRepository postMongoRepo = postMongoRepositoryProvider.getIfAvailable();
        PostLikeMongoRepository likeRepo = postLikeMongoRepositoryProvider.getIfAvailable();

        if (postMongoRepo == null || likeRepo == null) {
            return Map.of("isLiked", false, "likeCount", 0);
        }

        PostDocument post = postMongoRepo.findByPostId(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));

        boolean exists = likeRepo.existsByPostIdAndUserId(postId, userId);
        boolean isLiked;
        if (exists) {
            likeRepo.deleteByPostIdAndUserId(postId, userId);
            post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
            isLiked = false;
        } else {
            likeRepo.save(new PostLikeDocument(postId, userId));
            post.setLikeCount(post.getLikeCount() + 1);
            isLiked = true;
            recordInteraction(userId, "POST_LIKE", postId, "POST");
        }
        postMongoRepo.save(post);

        return Map.of("isLiked", isLiked, "likeCount", post.getLikeCount());
    }

    /**
     * Toggle Product Like
     */
    public Map<String, Object> toggleProductLike(Long productId, Long userId) {
        ProductLikeMongoRepository prodLikeRepo = productLikeMongoRepositoryProvider.getIfAvailable();
        if (prodLikeRepo == null) return Map.of("isLiked", false, "likeCount", 0);

        boolean exists = prodLikeRepo.existsByProductIdAndUserId(productId, userId);
        boolean isLiked;
        if (exists) {
            prodLikeRepo.deleteByProductIdAndUserId(productId, userId);
            isLiked = false;
        } else {
            prodLikeRepo.save(new ProductLikeDocument(productId, userId));
            isLiked = true;
            recordInteraction(userId, "PRODUCT_LIKE", String.valueOf(productId), "PRODUCT");
        }
        long likeCount = prodLikeRepo.countByProductId(productId);

        return Map.of("isLiked", isLiked, "likeCount", likeCount);
    }

    /**
     * Record Deduplicated Post View
     */
    public void recordPostView(String postId, Long userId) {
        PostMongoRepository postMongoRepo = postMongoRepositoryProvider.getIfAvailable();
        if (postMongoRepo == null) return;

        postMongoRepo.findByPostId(postId).ifPresent(post -> {
            post.setViewCount(post.getViewCount() + 1);
            postMongoRepo.save(post);
            if (userId != null) {
                recordInteraction(userId, "POST_VIEW", postId, "POST");
            }
        });
    }

    /**
     * Add Comment to Post
     */
    public PostCommentDocument addComment(String postId, Long userId, String userName, String userAvatar, String comment, String parentCommentId) {
        PostMongoRepository postMongoRepo = postMongoRepositoryProvider.getIfAvailable();
        PostCommentMongoRepository commentRepo = postCommentMongoRepositoryProvider.getIfAvailable();
        if (postMongoRepo == null || commentRepo == null) return null;

        PostDocument post = postMongoRepo.findByPostId(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));

        PostCommentDocument commentDoc = new PostCommentDocument();
        commentDoc.setPostId(postId);
        commentDoc.setUserId(userId);
        commentDoc.setUserName(userName != null ? userName : "Customer");
        commentDoc.setUserAvatar(userAvatar);
        commentDoc.setComment(comment);
        commentDoc.setParentCommentId(parentCommentId);

        PostCommentDocument saved = commentRepo.save(commentDoc);

        post.setCommentCount(post.getCommentCount() + 1);
        postMongoRepo.save(post);

        if (userId != null) {
            recordInteraction(userId, "POST_COMMENT", postId, "POST");
        }

        return saved;
    }

    /**
     * Get paginated comments
     */
    public Page<PostCommentDocument> getComments(String postId, int page, int size) {
        PostCommentMongoRepository commentRepo = postCommentMongoRepositoryProvider.getIfAvailable();
        if (commentRepo == null) return Page.empty();

        return commentRepo.findByPostIdAndStatusOrderByCreatedAtDesc(
                postId, "ACTIVE", PageRequest.of(page, size)
        );
    }

    /**
     * Record User Interaction
     */
    public void recordInteraction(Long userId, String interactionType, String targetId, String targetType) {
        UserInteractionMongoRepository repo = userInteractionMongoRepositoryProvider.getIfAvailable();
        if (repo == null) return;
        try {
            repo.save(new UserInteractionDocument(userId, interactionType, targetId, targetType));
        } catch (Exception e) {
            log.warn("Failed to record interaction: {}", e.getMessage());
        }
    }

    /**
     * Record Search Event
     */
    public void recordSearchEvent(Long userId, String query, int resultsCount) {
        SearchEventMongoRepository repo = searchEventMongoRepositoryProvider.getIfAvailable();
        if (repo == null) return;
        try {
            repo.save(new SearchEventDocument(userId, query, resultsCount));
        } catch (Exception e) {
            log.warn("Failed to record search event: {}", e.getMessage());
        }
    }

    /**
     * Query Feed and Enrich with MySQL Product and Channel Metadata
     */
    public Map<String, Object> getEnrichedFeed(int page, int size, Long currentUserId) {
        PostMongoRepository postMongoRepo = postMongoRepositoryProvider.getIfAvailable();
        if (postMongoRepo == null) return Map.of("posts", Collections.emptyList(), "totalElements", 0, "totalPages", 0, "page", page);

        Page<PostDocument> postPage = postMongoRepo.findByStatusOrderByCreatedAtDesc(
                "ACTIVE", PageRequest.of(page, size)
        );

        List<Map<String, Object>> enrichedList = new ArrayList<>();
        for (PostDocument p : postPage.getContent()) {
            enrichedList.add(enrichPostData(p, currentUserId));
        }

        return Map.of(
                "posts", enrichedList,
                "totalElements", postPage.getTotalElements(),
                "totalPages", postPage.getTotalPages(),
                "page", page
        );
    }

    /**
     * Query Channel Posts and Enrich
     */
    public Map<String, Object> getChannelPosts(Long channelId, int page, int size, Long currentUserId) {
        PostMongoRepository postMongoRepo = postMongoRepositoryProvider.getIfAvailable();
        if (postMongoRepo == null) return Map.of("posts", Collections.emptyList(), "totalElements", 0, "totalPages", 0, "page", page);

        Page<PostDocument> postPage = postMongoRepo.findByChannelIdAndStatusOrderByCreatedAtDesc(
                channelId, "ACTIVE", PageRequest.of(page, size)
        );

        List<Map<String, Object>> enrichedList = new ArrayList<>();
        for (PostDocument p : postPage.getContent()) {
            enrichedList.add(enrichPostData(p, currentUserId));
        }

        return Map.of(
                "posts", enrichedList,
                "totalElements", postPage.getTotalElements(),
                "totalPages", postPage.getTotalPages(),
                "page", page
        );
    }

    private Map<String, Object> enrichPostData(PostDocument p, Long currentUserId) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", p.getId());
        map.put("postId", p.getPostId());
        map.put("farmerId", p.getFarmerId());
        map.put("farmerName", p.getFarmerName());
        map.put("channelId", p.getChannelId());
        map.put("productId", p.getProductId());
        map.put("title", p.getTitle());
        map.put("content", p.getContent());
        map.put("mediaUrl", p.getMediaUrl());
        map.put("tags", String.join(", ", p.getTags()));
        map.put("price", p.getPrice());
        map.put("discountPercent", p.getDiscountPercent());
        map.put("callToAction", p.getCallToAction());
        map.put("originalPostId", p.getOriginalPostId());
        map.put("isRepost", p.getOriginalPostId() != null);
        map.put("repostCount", p.getRepostCount());
        map.put("likeCount", p.getLikeCount());
        map.put("commentCount", p.getCommentCount());
        map.put("viewCount", p.getViewCount());
        map.put("createdAt", p.getCreatedAt().toString());

        boolean isLiked = false;
        PostLikeMongoRepository likeRepo = postLikeMongoRepositoryProvider.getIfAvailable();
        if (currentUserId != null && likeRepo != null) {
            isLiked = likeRepo.existsByPostIdAndUserId(p.getPostId(), currentUserId);
        }
        map.put("isLiked", isLiked);

        // Enrich with MySQL Channel data
        if (p.getChannelId() != null) {
            farmerChannelRepository.findById(p.getChannelId()).ifPresent(ch -> {
                map.put("channelName", ch.getName());
                map.put("channelCode", ch.getChannelId());
                map.put("channelBanner", ch.getBannerImage());
            });
        }

        // Enrich with MySQL Product data (Source of Truth for price/unit/stock)
        if (p.getProductId() != null) {
            productRepository.findById(p.getProductId()).ifPresent(prod -> {
                map.put("productName", prod.getName());
                map.put("productCode", prod.getProductId());
                map.put("unit", prod.getUnit());
                map.put("productImage", prod.getImageUrl());
                map.put("category", prod.getCategory() != null ? prod.getCategory().getName() : "");
                map.put("availableQuantity", prod.getAvailableQuantity());
            });
        }

        return map;
    }
}

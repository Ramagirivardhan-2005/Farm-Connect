package com.farmconnect.modules.posts.service;

import com.farmconnect.modules.channels.model.FarmerChannel;
import com.farmconnect.modules.channels.repository.FarmerChannelRepository;
import com.farmconnect.modules.interactions.model.UserInteraction;
import com.farmconnect.modules.interactions.repository.UserInteractionRepository;
import com.farmconnect.modules.posts.model.Post;
import com.farmconnect.modules.posts.model.PostComment;
import com.farmconnect.modules.posts.model.PostLike;
import com.farmconnect.modules.posts.model.PostStatus;
import com.farmconnect.modules.posts.repository.PostCommentRepository;
import com.farmconnect.modules.posts.repository.PostLikeRepository;
import com.farmconnect.modules.posts.repository.PostRepository;
import com.farmconnect.modules.products.model.Product;
import com.farmconnect.modules.products.repository.ProductRepository;
import com.farmconnect.modules.users.model.User;
import com.farmconnect.modules.users.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PostService {

    // Configurable anti-duplicate cooldown duration (30 minutes)
    private static final Duration DUPLICATE_COOLDOWN = Duration.ofMinutes(30);

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final PostCommentRepository postCommentRepository;
    private final FarmerChannelRepository farmerChannelRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final UserInteractionRepository userInteractionRepository;
    private final com.farmconnect.modules.content.mongo.service.ContentSocialService contentSocialService;

    public PostService(PostRepository postRepository,
                       PostLikeRepository postLikeRepository,
                       PostCommentRepository postCommentRepository,
                       FarmerChannelRepository farmerChannelRepository,
                       ProductRepository productRepository,
                       UserRepository userRepository,
                       UserInteractionRepository userInteractionRepository,
                       com.farmconnect.modules.content.mongo.service.ContentSocialService contentSocialService) {
        this.postRepository = postRepository;
        this.postLikeRepository = postLikeRepository;
        this.postCommentRepository = postCommentRepository;
        this.farmerChannelRepository = farmerChannelRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.userInteractionRepository = userInteractionRepository;
        this.contentSocialService = contentSocialService;
    }

    @Transactional
    public Map<String, Object> createPost(Long farmerId, Long channelId, Map<String, Object> req) {
        User farmer = userRepository.findById(farmerId)
                .orElseThrow(() -> new IllegalArgumentException("Farmer not found"));

        FarmerChannel channel = farmerChannelRepository.findById(channelId)
                .orElseThrow(() -> new IllegalArgumentException("Channel not found"));

        if (!channel.getFarmer().getId().equals(farmerId)) {
            throw new IllegalArgumentException("Only the farmer who owns this channel can publish posts.");
        }

        String title = (String) req.get("title");
        String content = (String) req.get("content");
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Post title is required.");
        }
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Post content description is required.");
        }

        // Anti-duplicate protection (Instruction 24, 26, 27)
        Instant cooldownThreshold = Instant.now().minus(DUPLICATE_COOLDOWN);
        List<Post> recentDuplicates = postRepository.findRecentSimilarPosts(farmerId, title.trim(), cooldownThreshold);
        if (!recentDuplicates.isEmpty()) {
            throw new IllegalArgumentException(
                "Similar post already exists. You have already posted this item recently. " +
                "You can repost it after the 30-minute cooldown period or use the controlled 'Repost' button."
            );
        }

        Post post = new Post();
        post.setPostId("POST-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        post.setChannel(channel);
        post.setFarmer(farmer);
        post.setTitle(title.trim());
        post.setContent(content.trim());
        post.setMediaUrl((String) req.get("mediaUrl"));
        post.setCategory((String) req.get("category"));
        post.setTags((String) req.get("tags"));
        post.setCallToAction((String) req.getOrDefault("callToAction", "Shop Now"));

        if (req.containsKey("price") && req.get("price") != null) {
            post.setPrice(new BigDecimal(req.get("price").toString()));
        }
        if (req.containsKey("discountPercent") && req.get("discountPercent") != null) {
            post.setDiscountPercent(((Number) req.get("discountPercent")).intValue());
        }
        if (req.containsKey("unit") && req.get("unit") != null) {
            post.setUnit((String) req.get("unit"));
        }
        if (req.containsKey("availableQuantity") && req.get("availableQuantity") != null) {
            post.setAvailableQuantity(new BigDecimal(req.get("availableQuantity").toString()));
        }

        // Optional product link
        if (req.containsKey("productId") && req.get("productId") != null) {
            Long prodId = ((Number) req.get("productId")).longValue();
            productRepository.findById(prodId).ifPresent(post::setProduct);
        }

        post.setStatus(PostStatus.ACTIVE);
        post.setStartDate(Instant.now());
        post.setCreatedAt(Instant.now());

        Post saved = postRepository.save(post);

        // Sync to MongoDB flexible content store
        try {
            Long prodId = post.getProduct() != null ? post.getProduct().getId() : null;
            List<String> tagList = post.getTags() != null ? Arrays.asList(post.getTags().split(",\\s*")) : new ArrayList<>();
            contentSocialService.createPost(farmerId, farmer.getUsername(), channelId, prodId,
                    post.getTitle(), post.getContent(), post.getMediaUrl(), tagList,
                    post.getPrice(), post.getDiscountPercent(), post.getCallToAction());
        } catch (Exception ignored) {}

        return mapPost(saved, farmerId);
    }

    @Transactional
    public Map<String, Object> controlledRepost(Long farmerId, Long originalId) {
        Post original = postRepository.findById(originalId)
                .orElseThrow(() -> new IllegalArgumentException("Original post not found"));

        if (!original.getFarmer().getId().equals(farmerId)) {
            throw new IllegalArgumentException("You can only repost your own channel publications.");
        }

        // Increment original repost counter
        original.setRepostCount(original.getRepostCount() + 1);
        postRepository.save(original);

        // Create fresh post referencing original
        Post repost = new Post();
        repost.setPostId("POST-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        repost.setChannel(original.getChannel());
        repost.setFarmer(original.getFarmer());
        repost.setProduct(original.getProduct());
        repost.setTitle(original.getTitle());
        repost.setContent(original.getContent());
        repost.setPrice(original.getPrice());
        repost.setDiscountPercent(original.getDiscountPercent());
        repost.setUnit(original.getUnit());
        repost.setAvailableQuantity(original.getAvailableQuantity());
        repost.setCategory(original.getCategory());
        repost.setTags(original.getTags());
        repost.setCallToAction(original.getCallToAction());
        repost.setMediaUrl(original.getMediaUrl());
        repost.setOriginalPost(original);
        repost.setStatus(PostStatus.ACTIVE);
        repost.setStartDate(Instant.now());
        repost.setCreatedAt(Instant.now());

        Post saved = postRepository.save(repost);

        // Sync repost to MongoDB
        try {
            contentSocialService.repost(original.getPostId(), farmerId, original.getFarmer().getUsername());
        } catch (Exception ignored) {}

        return mapPost(saved, farmerId);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getChannelPosts(Long channelId, int page, int size, Long currentUserId) {
        Page<Post> paged = postRepository.findByChannelIdAndStatusOrderByCreatedAtDesc(
                channelId, PostStatus.ACTIVE, PageRequest.of(page, size));

        List<Map<String, Object>> items = paged.getContent().stream()
                .map(p -> mapPost(p, currentUserId))
                .collect(Collectors.toList());

        Map<String, Object> res = new HashMap<>();
        res.put("posts", items);
        res.put("data", items);
        res.put("totalElements", paged.getTotalElements());
        res.put("totalPages", paged.getTotalPages());
        res.put("page", page);
        return res;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getFeedPosts(int page, int size, Long currentUserId) {
        Page<Post> paged = postRepository.findByStatusOrderByCreatedAtDesc(
                PostStatus.ACTIVE, PageRequest.of(page, size));

        List<Map<String, Object>> items = paged.getContent().stream()
                .map(p -> mapPost(p, currentUserId))
                .collect(Collectors.toList());

        Map<String, Object> res = new HashMap<>();
        res.put("posts", items);
        res.put("data", items);
        res.put("totalElements", paged.getTotalElements());
        res.put("totalPages", paged.getTotalPages());
        res.put("page", page);
        return res;
    }

    @Transactional
    public Map<String, Object> togglePostLike(Long userId, Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Optional<PostLike> existing = postLikeRepository.findByPostIdAndUserId(postId, userId);
        boolean liked;
        if (existing.isPresent()) {
            postLikeRepository.delete(existing.get());
            post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
            liked = false;
        } else {
            postLikeRepository.save(new PostLike(post, user));
            post.setLikeCount(post.getLikeCount() + 1);
            liked = true;

            // Log interaction event
            userInteractionRepository.save(new UserInteraction(
                    userId, null, "POST", postId, "POST_LIKE", null));
        }

        // Sync like to MongoDB
        try {
            contentSocialService.togglePostLike(post.getPostId(), userId);
        } catch (Exception ignored) {}

        postRepository.save(post);
        Map<String, Object> res = new HashMap<>();
        res.put("liked", liked);
        res.put("likeCount", post.getLikeCount());
        return res;
    }

    @Transactional
    public Map<String, Object> addComment(Long userId, Long postId, String commentText, Long parentCommentId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        PostComment parent = null;
        if (parentCommentId != null) {
            parent = postCommentRepository.findById(parentCommentId).orElse(null);
        }

        PostComment comment = new PostComment(post, user, commentText.trim(), parent);
        PostComment saved = postCommentRepository.save(comment);

        post.setCommentCount(post.getCommentCount() + 1);
        postRepository.save(post);

        userInteractionRepository.save(new UserInteraction(
                userId, null, "POST", postId, "POST_COMMENT", null));

        // Sync comment to MongoDB
        try {
            contentSocialService.addComment(post.getPostId(), userId, user.getUsername(), user.getAvatarUrl(),
                    commentText, parentCommentId != null ? String.valueOf(parentCommentId) : null);
        } catch (Exception ignored) {}

        Map<String, Object> map = new HashMap<>();
        map.put("id", saved.getId());
        map.put("userId", user.getId());
        map.put("userName", user.getUsername());
        map.put("userAvatar", user.getAvatarUrl());
        map.put("comment", saved.getComment());
        map.put("createdAt", saved.getCreatedAt());
        return map;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getComments(Long postId, int page, int size) {
        Page<PostComment> paged = postCommentRepository.findByPostIdAndStatusOrderByCreatedAtAsc(
                postId, "ACTIVE", PageRequest.of(page, size));

        List<Map<String, Object>> list = paged.getContent().stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("userId", c.getUser().getId());
            map.put("userName", c.getUser().getUsername());
            map.put("userAvatar", c.getUser().getAvatarUrl());
            map.put("comment", c.getComment());
            map.put("parentCommentId", c.getParentComment() != null ? c.getParentComment().getId() : null);
            map.put("createdAt", c.getCreatedAt());
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> res = new HashMap<>();
        res.put("comments", list);
        res.put("total", paged.getTotalElements());
        res.put("page", page);
        return res;
    }

    @Transactional
    public void trackView(Long postId, Long userId, String sessionId) {
        postRepository.findById(postId).ifPresent(p -> {
            p.setViewCount(p.getViewCount() + 1);
            postRepository.save(p);

            userInteractionRepository.save(new UserInteraction(
                    userId, sessionId, "POST", postId, "POST_VIEW", null));

            // Sync view to MongoDB
            try {
                contentSocialService.recordPostView(p.getPostId(), userId);
            } catch (Exception ignored) {}
        });
    }

    private Map<String, Object> mapPost(Post p, Long currentUserId) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", p.getId());
        map.put("postId", p.getPostId());
        map.put("title", p.getTitle());
        map.put("content", p.getContent());
        map.put("mediaUrl", p.getMediaUrl());
        map.put("price", p.getPrice());
        map.put("discountPercent", p.getDiscountPercent());
        map.put("unit", p.getUnit());
        map.put("availableQuantity", p.getAvailableQuantity());
        map.put("category", p.getCategory());
        map.put("tags", p.getTags());
        map.put("callToAction", p.getCallToAction());
        map.put("likeCount", p.getLikeCount());
        map.put("commentCount", p.getCommentCount());
        map.put("viewCount", p.getViewCount());
        map.put("repostCount", p.getRepostCount());
        map.put("isRepost", p.getOriginalPost() != null);
        map.put("createdAt", p.getCreatedAt());

        if (p.getChannel() != null) {
            map.put("channelId", p.getChannel().getId());
            map.put("channelCode", p.getChannel().getChannelId());
            map.put("channelName", p.getChannel().getName());
            map.put("channelBanner", p.getChannel().getBannerImage());
        }

        if (p.getFarmer() != null) {
            map.put("farmerId", p.getFarmer().getId());
            map.put("farmerName", p.getFarmer().getUsername());
            map.put("farmerAvatar", p.getFarmer().getAvatarUrl());
        }

        if (p.getProduct() != null) {
            map.put("productId", p.getProduct().getId());
            map.put("productCode", p.getProduct().getProductId());
            map.put("productName", p.getProduct().getName());
            map.put("productImage", p.getProduct().getImageUrl());
        }

        boolean isLiked = false;
        if (currentUserId != null) {
            isLiked = postLikeRepository.existsByPostIdAndUserId(p.getId(), currentUserId);
        }
        map.put("isLiked", isLiked);

        return map;
    }
}

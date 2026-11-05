package com.farmconnect.modules.posts.controller;

import com.farmconnect.common.ApiResponse;
import com.farmconnect.modules.posts.service.PostService;
import com.farmconnect.security.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/posts", "/api/v1/posts"})
public class PostController {

    private final PostService postService;
    private final SecurityUtils securityUtils;

    public PostController(PostService postService, SecurityUtils securityUtils) {
        this.postService = postService;
        this.securityUtils = securityUtils;
    }

    @GetMapping("/feed")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Long currentUserId = null;
        try { currentUserId = securityUtils.currentUserId(); } catch (Exception ignored) {}
        Map<String, Object> feed = postService.getFeedPosts(page, size, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Channel feed retrieved", feed));
    }

    @GetMapping("/channels/{channelId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getChannelPosts(
            @PathVariable Long channelId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Long currentUserId = null;
        try { currentUserId = securityUtils.currentUserId(); } catch (Exception ignored) {}
        Map<String, Object> res = postService.getChannelPosts(channelId, page, size, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Posts retrieved", res));
    }

    @PostMapping("/channels/{channelId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createPost(
            @PathVariable Long channelId,
            @RequestBody Map<String, Object> req) {
        Long farmerId = securityUtils.currentUserId();
        Map<String, Object> post = postService.createPost(farmerId, channelId, req);
        return ResponseEntity.ok(ApiResponse.ok("Post published successfully", post));
    }

    @PostMapping("/{postId}/repost")
    public ResponseEntity<ApiResponse<Map<String, Object>>> repost(@PathVariable Long postId) {
        Long farmerId = securityUtils.currentUserId();
        Map<String, Object> repost = postService.controlledRepost(farmerId, postId);
        return ResponseEntity.ok(ApiResponse.ok("Post reposted successfully to channel feed", repost));
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleLike(@PathVariable Long postId) {
        Long currentUserId = securityUtils.currentUserId();
        Map<String, Object> res = postService.togglePostLike(currentUserId, postId);
        return ResponseEntity.ok(ApiResponse.ok("Like updated", res));
    }

    @GetMapping("/{postId}/comments")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getComments(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Map<String, Object> comments = postService.getComments(postId, page, size);
        return ResponseEntity.ok(ApiResponse.ok("Comments retrieved", comments));
    }

    @PostMapping("/{postId}/comments")
    public ResponseEntity<ApiResponse<Map<String, Object>>> addComment(
            @PathVariable Long postId,
            @RequestBody Map<String, Object> req) {
        Long currentUserId = securityUtils.currentUserId();
        String comment = (String) req.get("comment");
        Long parentId = null;
        if (req.containsKey("parentCommentId") && req.get("parentCommentId") != null) {
            parentId = ((Number) req.get("parentCommentId")).longValue();
        }
        Map<String, Object> saved = postService.addComment(currentUserId, postId, comment, parentId);
        return ResponseEntity.ok(ApiResponse.ok("Comment posted", saved));
    }

    @PostMapping("/{postId}/view")
    public ResponseEntity<ApiResponse<String>> trackView(
            @PathVariable Long postId,
            @RequestBody(required = false) Map<String, String> req) {
        Long currentUserId = null;
        try { currentUserId = securityUtils.currentUserId(); } catch (Exception ignored) {}
        String sessionId = req != null ? req.get("sessionId") : null;
        postService.trackView(postId, currentUserId, sessionId);
        return ResponseEntity.ok(ApiResponse.ok("View tracked", "OK"));
    }
}

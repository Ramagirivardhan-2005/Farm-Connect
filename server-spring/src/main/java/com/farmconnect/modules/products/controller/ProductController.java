package com.farmconnect.modules.products.controller;

import com.farmconnect.common.ApiResponse;
import com.farmconnect.modules.products.model.Product;
import com.farmconnect.modules.products.model.ProductCategory;
import com.farmconnect.modules.products.service.ProductService;
import com.farmconnect.security.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class ProductController {

    private final ProductService productService;
    private final SecurityUtils securityUtils;

    public ProductController(ProductService productService, SecurityUtils securityUtils) {
        this.productService = productService;
        this.securityUtils = securityUtils;
    }

    @GetMapping({"/api/channels", "/api/v1/channels"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getChannels() {
        List<Map<String, Object>> channels = productService.getAllChannels();
        return ResponseEntity.ok(ApiResponse.ok(Map.of("data", channels, "channels", channels)));
    }

    @GetMapping({"/api/channels/{channelId}", "/api/v1/channels/{channelId}"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getChannelDetail(@PathVariable String channelId) {
        Map<String, Object> detail = productService.getChannelDetail(channelId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("data", detail)));
    }

    @GetMapping({"/api/products", "/api/v1/products", "/api/items", "/api/v1/items"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long categoryId) {
        Page<Product> paged = productService.getProducts(page, size, categoryId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "data", paged.getContent(),
                "products", paged.getContent(),
                "totalElements", paged.getTotalElements(),
                "totalPages", paged.getTotalPages()
        )));
    }

    @GetMapping({"/api/products/categories", "/api/v1/products/categories"})
    public ResponseEntity<ApiResponse<List<ProductCategory>>> getCategories() {
        List<ProductCategory> categories = productService.getCategories();
        return ResponseEntity.ok(ApiResponse.ok(categories));
    }

    @GetMapping({"/api/products/{id}", "/api/v1/products/{id}", "/api/items/{id}", "/api/v1/items/{id}"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProductById(@PathVariable Long id) {
        Long currentUserId = null;
        try { currentUserId = securityUtils.currentUserId(); } catch (Exception ignored) {}
        Map<String, Object> enriched = productService.getProductDetailEnriched(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok(enriched));
    }

    @PostMapping({"/api/items", "/api/v1/items"})
    public ResponseEntity<ApiResponse<Product>> createProduct(@RequestBody Map<String, Object> data) {
        Long farmerId = securityUtils.currentUserId();
        Product product = productService.createProduct(farmerId, data);
        return ResponseEntity.ok(ApiResponse.ok("Product listed successfully", product));
    }

    // =========================================================================
    // PRODUCT INTERACTIONS (Like, Comments, Replies, Share, Report, View)
    // =========================================================================

    @PostMapping({"/api/products/{id}/like", "/api/v1/products/{id}/like"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleLike(@PathVariable Long id) {
        Long currentUserId = securityUtils.currentUserId();
        Map<String, Object> res = productService.toggleProductLike(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Product like updated", res));
    }

    @GetMapping({"/api/products/{id}/comments", "/api/v1/products/{id}/comments"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getComments(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> comments = productService.getComments(id, page, size);
        return ResponseEntity.ok(ApiResponse.ok("Comments retrieved", comments));
    }

    @GetMapping({"/api/products/{id}/comments/{commentId}/replies", "/api/v1/products/{id}/comments/{commentId}/replies"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCommentReplies(
            @PathVariable Long id,
            @PathVariable Long commentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> replies = productService.getCommentReplies(commentId, page, size);
        return ResponseEntity.ok(ApiResponse.ok("Replies retrieved", replies));
    }

    @PostMapping({"/api/products/{id}/comments", "/api/v1/products/{id}/comments"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> addComment(
            @PathVariable Long id,
            @RequestBody Map<String, Object> req) {
        Long currentUserId = securityUtils.currentUserId();
        String commentText = (String) req.get("comment");
        Long parentCommentId = null;
        if (req.containsKey("parentCommentId") && req.get("parentCommentId") != null) {
            parentCommentId = ((Number) req.get("parentCommentId")).longValue();
        }
        Map<String, Object> saved = productService.addComment(id, currentUserId, commentText, parentCommentId);
        return ResponseEntity.ok(ApiResponse.ok("Comment posted", saved));
    }

    @PostMapping({"/api/products/{id}/share", "/api/v1/products/{id}/share"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> trackShare(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> req) {
        Long currentUserId = null;
        try { currentUserId = securityUtils.currentUserId(); } catch (Exception ignored) {}
        String platform = req != null ? req.get("platform") : "COPY_LINK";
        Map<String, Object> res = productService.shareProduct(id, currentUserId, platform);
        return ResponseEntity.ok(ApiResponse.ok("Share recorded", res));
    }

    @PostMapping({"/api/products/{id}/report", "/api/v1/products/{id}/report"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> reportProduct(
            @PathVariable Long id,
            @RequestBody Map<String, String> req) {
        Long currentUserId = securityUtils.currentUserId();
        String reason = req.getOrDefault("reason", "Inappropriate or inaccurate produce listing");
        String details = req.getOrDefault("details", "");
        Map<String, Object> res = productService.reportProduct(id, currentUserId, reason, details);
        return ResponseEntity.ok(ApiResponse.ok("Product reported", res));
    }

    @PostMapping({"/api/products/{id}/view", "/api/v1/products/{id}/view"})
    public ResponseEntity<ApiResponse<String>> trackView(@PathVariable Long id) {
        Long currentUserId = null;
        try { currentUserId = securityUtils.currentUserId(); } catch (Exception ignored) {}
        productService.trackView(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("View recorded", "OK"));
    }
}

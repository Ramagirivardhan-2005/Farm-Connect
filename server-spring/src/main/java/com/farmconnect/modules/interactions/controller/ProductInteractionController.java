package com.farmconnect.modules.interactions.controller;

import com.farmconnect.common.ApiResponse;
import com.farmconnect.modules.interactions.service.ProductInteractionService;
import com.farmconnect.security.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/products", "/api/v1/products"})
public class ProductInteractionController {

    private final ProductInteractionService interactionService;
    private final SecurityUtils securityUtils;

    public ProductInteractionController(ProductInteractionService interactionService, SecurityUtils securityUtils) {
        this.interactionService = interactionService;
        this.securityUtils = securityUtils;
    }

    @PostMapping("/{productId}/like")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleProductLike(@PathVariable Long productId) {
        Long currentUserId = securityUtils.currentUserId();
        Map<String, Object> res = interactionService.toggleProductLike(currentUserId, productId);
        return ResponseEntity.ok(ApiResponse.ok("Product like updated", res));
    }

    @PostMapping("/{productId}/view")
    public ResponseEntity<ApiResponse<String>> trackProductView(
            @PathVariable Long productId,
            @RequestBody(required = false) Map<String, String> req) {
        Long currentUserId = null;
        try { currentUserId = securityUtils.currentUserId(); } catch (Exception ignored) {}
        String sessionId = req != null ? req.get("sessionId") : null;
        interactionService.trackView(productId, currentUserId, sessionId);
        return ResponseEntity.ok(ApiResponse.ok("View tracked", "OK"));
    }

    @GetMapping("/{productId}/related")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRelatedProducts(@PathVariable Long productId) {
        List<Map<String, Object>> related = interactionService.getRelatedProducts(productId);
        return ResponseEntity.ok(ApiResponse.ok("Related items retrieved", related));
    }

    @GetMapping("/{productId}/is-liked")
    public ResponseEntity<ApiResponse<Boolean>> isProductLiked(@PathVariable Long productId) {
        Long currentUserId = null;
        try { currentUserId = securityUtils.currentUserId(); } catch (Exception ignored) {}
        boolean liked = interactionService.isProductLiked(currentUserId, productId);
        return ResponseEntity.ok(ApiResponse.ok("Like status", liked));
    }
}

package com.farmconnect.modules.promotions.controller;

import com.farmconnect.common.ApiResponse;
import com.farmconnect.modules.promotions.model.PromotionStatus;
import com.farmconnect.modules.promotions.service.PromotionService;
import com.farmconnect.security.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/promotions", "/api/v1/promotions", "/api/banners", "/api/v1/banners"})
public class PromotionController {

    private final PromotionService promotionService;
    private final SecurityUtils securityUtils;

    public PromotionController(PromotionService promotionService, SecurityUtils securityUtils) {
        this.promotionService = promotionService;
        this.securityUtils = securityUtils;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getPromotions() {
        Long currentUserId = null;
        try {
            currentUserId = securityUtils.getCurrentUserId();
        } catch (Exception ignored) {
        }
        List<Map<String, Object>> list = promotionService.getActivePromotionsForUser(currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Promotions retrieved", list));
    }

    @GetMapping("/farmer")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getFarmerPromotions() {
        Long farmerId = securityUtils.getCurrentUserId();
        List<Map<String, Object>> list = promotionService.getFarmerPromotions(farmerId);
        return ResponseEntity.ok(ApiResponse.ok("Farmer promotions retrieved", list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> createPromotion(@RequestBody Map<String, Object> req) {
        Long farmerId = securityUtils.getCurrentUserId();
        Map<String, Object> promo = promotionService.createPromotion(farmerId, req);
        return ResponseEntity.ok(ApiResponse.ok("Promotion created successfully", promo));
    }

    @PatchMapping("/{promoId}/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateStatus(
            @PathVariable String promoId,
            @RequestBody Map<String, String> req) {
        Long farmerId = securityUtils.getCurrentUserId();
        PromotionStatus status = PromotionStatus.valueOf(req.getOrDefault("status", "ACTIVE").toUpperCase());
        Map<String, Object> promo = promotionService.updateStatus(farmerId, promoId, status);
        return ResponseEntity.ok(ApiResponse.ok("Promotion status updated", promo));
    }

    @PostMapping("/{promoId}/view")
    public ResponseEntity<ApiResponse<String>> recordView(@PathVariable String promoId) {
        Long currentUserId = null;
        try {
            currentUserId = securityUtils.getCurrentUserId();
        } catch (Exception ignored) {}
        promotionService.recordView(promoId, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("View recorded", "OK"));
    }

    @PostMapping("/{promoId}/click")
    public ResponseEntity<ApiResponse<String>> recordClick(@PathVariable String promoId) {
        Long currentUserId = null;
        try {
            currentUserId = securityUtils.getCurrentUserId();
        } catch (Exception ignored) {}
        promotionService.recordClick(promoId, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Click recorded", "OK"));
    }
}

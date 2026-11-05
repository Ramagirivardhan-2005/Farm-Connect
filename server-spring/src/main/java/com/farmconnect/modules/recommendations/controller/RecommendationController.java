package com.farmconnect.modules.recommendations.controller;

import com.farmconnect.common.ApiResponse;
import com.farmconnect.modules.recommendations.service.RecommendationService;
import com.farmconnect.security.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/recommendations", "/api/v1/recommendations"})
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final SecurityUtils securityUtils;

    public RecommendationController(RecommendationService recommendationService, SecurityUtils securityUtils) {
        this.recommendationService = recommendationService;
        this.securityUtils = securityUtils;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRecommendations(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category) {
        Long currentUserId = null;
        try {
            currentUserId = securityUtils.getCurrentUserId();
        } catch (Exception ignored) {}

        List<Map<String, Object>> recs = recommendationService.getPersonalizedRecommendations(currentUserId, search, category);
        return ResponseEntity.ok(ApiResponse.ok("Recommendations generated successfully", recs));
    }
}

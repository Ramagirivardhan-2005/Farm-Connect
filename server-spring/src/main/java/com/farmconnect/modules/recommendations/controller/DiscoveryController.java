package com.farmconnect.modules.recommendations.controller;

import com.farmconnect.common.ApiResponse;
import com.farmconnect.modules.recommendations.service.DiscoveryService;
import com.farmconnect.security.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/discovery", "/api/v1/discovery"})
public class DiscoveryController {

    private final DiscoveryService discoveryService;
    private final SecurityUtils securityUtils;

    public DiscoveryController(DiscoveryService discoveryService, SecurityUtils securityUtils) {
        this.discoveryService = discoveryService;
        this.securityUtils = securityUtils;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng) {
        Long currentUserId = null;
        try {
            currentUserId = securityUtils.currentUserId();
        } catch (Exception ignored) {}

        Map<String, Object> discovery = discoveryService.getDashboardDiscovery(currentUserId, search, category, lat, lng);
        return ResponseEntity.ok(ApiResponse.ok("Discovery data generated", discovery));
    }
}

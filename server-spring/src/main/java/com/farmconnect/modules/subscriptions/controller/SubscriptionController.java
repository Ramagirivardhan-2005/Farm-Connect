package com.farmconnect.modules.subscriptions.controller;

import com.farmconnect.common.ApiResponse;
import com.farmconnect.modules.subscriptions.service.SubscriptionService;
import com.farmconnect.security.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/subscriptions", "/api/v1/subscriptions"})
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final SecurityUtils securityUtils;

    public SubscriptionController(SubscriptionService subscriptionService, SecurityUtils securityUtils) {
        this.subscriptionService = subscriptionService;
        this.securityUtils = securityUtils;
    }

    @PostMapping("/{farmerId}/toggle")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleSubscription(@PathVariable Long farmerId) {
        Long currentUserId = securityUtils.getCurrentUserId();
        Map<String, Object> res = subscriptionService.toggleSubscription(currentUserId, farmerId);
        return ResponseEntity.ok(ApiResponse.ok("Subscription updated", res));
    }

    @PostMapping("/{farmerId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> subscribe(@PathVariable Long farmerId) {
        Long currentUserId = securityUtils.getCurrentUserId();
        Map<String, Object> res = subscriptionService.toggleSubscription(currentUserId, farmerId);
        return ResponseEntity.ok(ApiResponse.ok("Subscribed", res));
    }

    @DeleteMapping("/{farmerId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> unsubscribe(@PathVariable Long farmerId) {
        Long currentUserId = securityUtils.getCurrentUserId();
        Map<String, Object> res = subscriptionService.toggleSubscription(currentUserId, farmerId);
        return ResponseEntity.ok(ApiResponse.ok("Unsubscribed", res));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMySubscriptions() {
        Long currentUserId = securityUtils.getCurrentUserId();
        List<Map<String, Object>> subs = subscriptionService.getMySubscriptions(currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Subscriptions retrieved", subs));
    }

    @GetMapping("/check/{farmerId}")
    public ResponseEntity<ApiResponse<Boolean>> isSubscribed(@PathVariable Long farmerId) {
        Long currentUserId = securityUtils.getCurrentUserId();
        boolean subscribed = subscriptionService.isSubscribed(currentUserId, farmerId);
        return ResponseEntity.ok(ApiResponse.ok("Subscription status", subscribed));
    }

    @GetMapping("/farmer/subscribers")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getFarmerSubscribers() {
        Long farmerId = securityUtils.getCurrentUserId();
        List<Map<String, Object>> subscribers = subscriptionService.getFarmerSubscribers(farmerId);
        return ResponseEntity.ok(ApiResponse.ok("Subscribers retrieved", subscribers));
    }
}

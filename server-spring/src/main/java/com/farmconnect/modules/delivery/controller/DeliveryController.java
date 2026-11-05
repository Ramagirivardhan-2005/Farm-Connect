package com.farmconnect.modules.delivery.controller;

import com.farmconnect.common.ApiResponse;
import com.farmconnect.modules.delivery.model.DeliveryAgent;
import com.farmconnect.modules.delivery.service.DeliveryService;
import com.farmconnect.modules.orders.model.Order;
import com.farmconnect.modules.orders.model.OrderStatus;
import com.farmconnect.security.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/delivery", "/api/v1/delivery"})
public class DeliveryController {

    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        Long userId = SecurityUtils.getCurrentUserId();
        Map<String, Object> stats = deliveryService.getDashboardStats(userId);
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/channels")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getChannels() {
        Long userId = SecurityUtils.getCurrentUserId();
        List<Map<String, Object>> channels = deliveryService.getAgentChannels(userId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("channels", channels)));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAvailablePickups() {
        Long userId = SecurityUtils.getCurrentUserId();
        List<Order> orders = deliveryService.getAvailablePickups(userId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("data", orders)));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getActiveDelivery() {
        Long userId = SecurityUtils.getCurrentUserId();
        Order active = deliveryService.getActiveDelivery(userId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("data", active != null ? active : Map.of())));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        DeliveryAgent agent = deliveryService.getAgentByUserId(userId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("data", agent)));
    }

    @PostMapping("/claim/{orderId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> claimOrder(@PathVariable Long orderId) {
        Long userId = SecurityUtils.getCurrentUserId();
        Order order = deliveryService.claimOrder(userId, orderId);
        return ResponseEntity.ok(ApiResponse.ok("Order claimed successfully", Map.of("data", order)));
    }

    @PatchMapping("/status/{orderId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> body) {
        Long userId = SecurityUtils.getCurrentUserId();
        OrderStatus status = OrderStatus.valueOf(body.get("status"));
        Order order = deliveryService.updateStatus(userId, orderId, status);
        return ResponseEntity.ok(ApiResponse.ok("Status updated", Map.of("data", order)));
    }

    @PostMapping("/orders/{orderId}/request-otp")
    public ResponseEntity<ApiResponse<Map<String, String>>> requestDeliveryOtp(@PathVariable Long orderId) {
        Long userId = SecurityUtils.getCurrentUserId();
        Map<String, String> result = deliveryService.requestDeliveryOtp(userId, orderId);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/orders/{orderId}/verify-otp")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyDeliveryOtp(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> body) {
        Long userId = SecurityUtils.getCurrentUserId();
        String otp = body.get("otp");
        Order order = deliveryService.verifyDeliveryOtp(userId, orderId, otp);
        return ResponseEntity.ok(ApiResponse.ok("Delivery confirmed via customer OTP", Map.of("data", order)));
    }
}

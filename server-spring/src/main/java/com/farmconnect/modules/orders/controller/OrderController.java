package com.farmconnect.modules.orders.controller;

import com.farmconnect.common.ApiResponse;
import com.farmconnect.modules.orders.model.Order;
import com.farmconnect.modules.orders.service.OrderService;
import com.farmconnect.security.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/orders", "/api/v1/orders"})
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> createOrder(@RequestBody Map<String, Object> request) {
        Long customerId = SecurityUtils.getCurrentUserId();
        Order order = orderService.createOrder(customerId, request);
        return ResponseEntity.ok(ApiResponse.ok("Order created and queued for farm dispatch", Map.of("data", order)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOrders() {
        Long customerId = SecurityUtils.getCurrentUserId();
        List<Order> orders = orderService.getMyOrders(customerId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("data", orders, "count", orders.size())));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyOrders() {
        Long customerId = SecurityUtils.getCurrentUserId();
        List<Order> orders = orderService.getMyOrders(customerId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("data", orders, "count", orders.size())));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOrderByOrderId(@PathVariable String orderId) {
        Order order = orderService.getOrderByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("data", order)));
    }
}

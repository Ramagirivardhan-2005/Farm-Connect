package com.farmconnect.common;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping({"/api/health", "/api/v1/health"})
public class HealthController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "FarmConnect Modular Monolith");
        health.put("architecture", "Spring Boot 3 + MySQL 8");
        health.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(health);
    }
}

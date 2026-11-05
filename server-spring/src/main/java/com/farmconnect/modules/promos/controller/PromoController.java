package com.farmconnect.modules.promos.controller;

import com.farmconnect.common.ApiResponse;
import com.farmconnect.modules.promos.model.PromoCode;
import com.farmconnect.modules.promos.service.PromoService;
import com.farmconnect.security.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/promos", "/api/v1/promos"})
public class PromoController {

    private final PromoService promoService;

    public PromoController(PromoService promoService) {
        this.promoService = promoService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPromos() {
        List<PromoCode> promos = promoService.getActivePromos();
        return ResponseEntity.ok(ApiResponse.ok(Map.of("promos", promos)));
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validatePromo(@RequestBody Map<String, Object> body) {
        Long userId = SecurityUtils.getCurrentUser().map(u -> u.getId()).orElse(null);
        String code = (String) body.get("code");
        BigDecimal orderAmount = body.get("orderAmount") != null
                ? new BigDecimal(body.get("orderAmount").toString())
                : BigDecimal.ZERO;

        Map<String, Object> result = promoService.validatePromo(userId, code, orderAmount);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}

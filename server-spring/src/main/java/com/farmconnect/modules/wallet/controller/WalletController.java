package com.farmconnect.modules.wallet.controller;

import com.farmconnect.common.ApiResponse;
import com.farmconnect.modules.wallet.model.TransactionType;
import com.farmconnect.modules.wallet.model.WalletTransaction;
import com.farmconnect.modules.wallet.service.WalletService;
import com.farmconnect.security.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping({"/api/wallet", "/api/v1/wallet"})
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getWallet() {
        Long userId = SecurityUtils.getCurrentUserId();
        Map<String, Object> data = walletService.getWalletOverview(userId);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @GetMapping("/balance")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBalance() {
        Long userId = SecurityUtils.getCurrentUserId();
        Map<String, Object> data = walletService.getWalletOverview(userId);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) TransactionType type) {
        Long userId = SecurityUtils.getCurrentUserId();
        Page<WalletTransaction> paged = walletService.getTransactions(userId, page, size, type);
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "transactions", paged.getContent(),
                "totalElements", paged.getTotalElements(),
                "totalPages", paged.getTotalPages()
        )));
    }

    @PostMapping("/add-funds")
    public ResponseEntity<ApiResponse<Map<String, Object>>> addFunds(@RequestBody Map<String, Object> body) {
        Long userId = SecurityUtils.getCurrentUserId();
        BigDecimal amount = new BigDecimal(body.get("amount").toString());
        Map<String, Object> res = walletService.addFunds(userId, amount);
        return ResponseEntity.ok(ApiResponse.ok(res));
    }

    @PostMapping("/razorpay/create-order")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createRazorpayOrder(@RequestBody Map<String, Object> body) {
        Long userId = SecurityUtils.getCurrentUserId();
        BigDecimal amount = new BigDecimal(body.get("amount").toString());
        Map<String, Object> orderData = walletService.createRazorpayOrder(userId, amount);
        return ResponseEntity.ok(ApiResponse.ok(orderData));
    }

    @PostMapping("/razorpay/verify")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyRazorpayPayment(@RequestBody Map<String, Object> body) {
        Long userId = SecurityUtils.getCurrentUserId();
        String orderId = (String) body.get("razorpay_order_id");
        String paymentId = (String) body.get("razorpay_payment_id");
        String signature = (String) body.get("razorpay_signature");
        BigDecimal amount = new BigDecimal(body.get("amount").toString());

        Map<String, Object> res = walletService.verifyRazorpayPayment(userId, orderId, paymentId, signature, amount);
        return ResponseEntity.ok(ApiResponse.ok(res));
    }
}

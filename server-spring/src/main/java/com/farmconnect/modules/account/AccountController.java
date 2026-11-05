package com.farmconnect.modules.account;

import com.farmconnect.common.ApiResponse;
import com.farmconnect.security.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/account", "/api/v1/account"})
public class AccountController {

    private final AccountService accountService;
    private final SecurityUtils securityUtils;

    public AccountController(AccountService accountService, SecurityUtils securityUtils) {
        this.accountService = accountService;
        this.securityUtils = securityUtils;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProfile() {
        Long userId = securityUtils.currentUserId();
        Map<String, Object> profile = accountService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.ok("User profile retrieved", profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateProfile(@RequestBody Map<String, Object> req) {
        Long userId = securityUtils.currentUserId();
        Map<String, Object> updated = accountService.updateProfile(userId, req);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", updated));
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<String>> changePassword(@RequestBody Map<String, String> req) {
        Long userId = securityUtils.currentUserId();
        String currentPassword = req.get("currentPassword");
        String newPassword = req.get("newPassword");

        if (currentPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Both currentPassword and newPassword are required"));
        }

        accountService.changePassword(userId, currentPassword, newPassword);
        return ResponseEntity.ok(ApiResponse.ok("Password updated successfully", "OK"));
    }

    @PutMapping("/settings")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateSettings(@RequestBody Map<String, Object> req) {
        Long userId = securityUtils.currentUserId();
        Map<String, Object> updated = accountService.updateSettings(userId, req);
        return ResponseEntity.ok(ApiResponse.ok("Settings saved successfully", updated));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<String>> deleteAccount() {
        Long userId = securityUtils.currentUserId();
        accountService.deleteAccount(userId);
        return ResponseEntity.ok(ApiResponse.ok("Account deactivated successfully", "DEACTIVATED"));
    }

    // =========================================================================
    // WISHLIST ENDPOINTS (Instruction 3)
    // =========================================================================

    @GetMapping("/wishlist")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getWishlist() {
        Long userId = securityUtils.currentUserId();
        List<Map<String, Object>> wishlist = accountService.getWishlist(userId);
        return ResponseEntity.ok(ApiResponse.ok("Wishlist retrieved", wishlist));
    }

    @PostMapping("/wishlist/{productId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> addToWishlist(@PathVariable Long productId) {
        Long userId = securityUtils.currentUserId();
        Map<String, Object> res = accountService.addToWishlist(userId, productId);
        return ResponseEntity.ok(ApiResponse.ok("Added to wishlist", res));
    }

    @DeleteMapping("/wishlist/{productId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> removeFromWishlist(@PathVariable Long productId) {
        Long userId = securityUtils.currentUserId();
        Map<String, Object> res = accountService.removeFromWishlist(userId, productId);
        return ResponseEntity.ok(ApiResponse.ok("Removed from wishlist", res));
    }

    @GetMapping("/wishlist/check/{productId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkWishlist(@PathVariable Long productId) {
        Long userId = null;
        try { userId = securityUtils.currentUserId(); } catch (Exception ignored) {}
        boolean isSaved = accountService.isWishlisted(userId, productId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("inWishlist", isSaved, "productId", productId)));
    }
}

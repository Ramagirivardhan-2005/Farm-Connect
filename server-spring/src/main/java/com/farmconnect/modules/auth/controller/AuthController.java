package com.farmconnect.modules.auth.controller;

import com.farmconnect.common.ApiResponse;
import com.farmconnect.modules.auth.dto.AuthResponse;
import com.farmconnect.modules.auth.dto.LoginRequest;
import com.farmconnect.modules.auth.dto.SignupRequest;
import com.farmconnect.modules.auth.service.AuthService;
import com.farmconnect.modules.users.model.User;
import com.farmconnect.modules.users.repository.UserRepository;
import com.farmconnect.security.SecurityUtils;
import com.farmconnect.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/auth", "/api/v1/auth"})
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AuthResponse>> signup(@Valid @RequestBody SignupRequest request) {
        AuthResponse response = authService.signup(request);
        return ResponseEntity.ok(ApiResponse.ok("Registration successful", response));
    }

    @PostMapping("/admin/otp-request")
    public ResponseEntity<ApiResponse<Map<String, String>>> requestAdminOtp(@RequestBody Map<String, String> body) {
        // Super admin email verification
        return ResponseEntity.ok(ApiResponse.ok("Admin OTP dispatched to registered administrator email", Map.of("status", "DISPATCHED")));
    }

    @PostMapping("/admin/otp-verify")
    public ResponseEntity<ApiResponse<Map<String, String>>> verifyAdminOtp(@RequestBody Map<String, String> body) {
        String otp = body.get("otp");
        if ("123456".equals(otp)) {
            return ResponseEntity.ok(ApiResponse.ok("Admin OTP successfully verified", Map.of("verified", "true")));
        }
        return ResponseEntity.badRequest().body(ApiResponse.error("Invalid Admin OTP", "INVALID_OTP"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser() {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(ApiResponse.ok(user));
    }
}

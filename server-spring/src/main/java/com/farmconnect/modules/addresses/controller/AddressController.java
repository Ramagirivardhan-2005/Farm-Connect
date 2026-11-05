package com.farmconnect.modules.addresses.controller;

import com.farmconnect.common.ApiResponse;
import com.farmconnect.modules.addresses.model.Address;
import com.farmconnect.modules.addresses.service.AddressService;
import com.farmconnect.security.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/addresses", "/api/v1/addresses"})
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAddresses() {
        Long userId = SecurityUtils.getCurrentUserId();
        List<Address> addresses = addressService.getAddresses(userId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("addresses", addresses)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> createAddress(@RequestBody Map<String, String> data) {
        Long userId = SecurityUtils.getCurrentUserId();
        Address address = addressService.createAddress(userId, data);
        return ResponseEntity.ok(ApiResponse.ok("Address added", Map.of("address", address)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateAddress(@PathVariable Long id, @RequestBody Map<String, String> data) {
        Long userId = SecurityUtils.getCurrentUserId();
        Address address = addressService.updateAddress(userId, id, data);
        return ResponseEntity.ok(ApiResponse.ok("Address updated", Map.of("address", address)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        addressService.deleteAddress(userId, id);
        return ResponseEntity.ok(ApiResponse.ok("Address deleted", null));
    }

    @PatchMapping("/{id}/default")
    public ResponseEntity<ApiResponse<Map<String, Object>>> setDefaultAddress(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Address address = addressService.setDefaultAddress(userId, id);
        return ResponseEntity.ok(ApiResponse.ok("Default address updated", Map.of("address", address)));
    }
}

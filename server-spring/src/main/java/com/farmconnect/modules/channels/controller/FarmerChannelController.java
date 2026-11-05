package com.farmconnect.modules.channels.controller;

import com.farmconnect.common.ApiResponse;
import com.farmconnect.modules.channels.model.FarmerChannel;
import com.farmconnect.modules.channels.service.FarmerChannelService;
import com.farmconnect.modules.delivery.model.DeliveryAgent;
import com.farmconnect.security.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/farmers", "/api/v1/farmers"})
public class FarmerChannelController {

    private final FarmerChannelService channelService;

    public FarmerChannelController(FarmerChannelService channelService) {
        this.channelService = channelService;
    }

    @GetMapping("/channels")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getChannels() {
        Long farmerId = SecurityUtils.getCurrentUserId();
        List<FarmerChannel> channels = channelService.getChannelsByFarmer(farmerId);
        return ResponseEntity.ok(ApiResponse.ok("Channels retrieved", Map.of("channels", channels)));
    }

    @PostMapping("/channels")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createChannel(@RequestBody Map<String, Object> body) {
        Long farmerId = SecurityUtils.getCurrentUserId();
        String name = (String) body.get("name");
        String description = (String) body.getOrDefault("description", "");
        BigDecimal fee = body.get("defaultDeliveryFee") != null
                ? new BigDecimal(body.get("defaultDeliveryFee").toString())
                : new BigDecimal("40.00");
        BigDecimal threshold = body.get("freeDeliveryThreshold") != null
                ? new BigDecimal(body.get("freeDeliveryThreshold").toString())
                : new BigDecimal("499.00");

        FarmerChannel channel = channelService.createChannel(farmerId, name, description, fee, threshold);
        return ResponseEntity.ok(ApiResponse.ok("Channel created", Map.of("channel", channel)));
    }

    @PostMapping("/channels/{channelId}/agents")
    public ResponseEntity<ApiResponse<Map<String, Object>>> assignAgents(
            @PathVariable Long channelId,
            @RequestBody Map<String, List<Long>> body) {
        Long farmerId = SecurityUtils.getCurrentUserId();
        List<Long> agentIds = body.getOrDefault("agentIds", List.of());
        FarmerChannel channel = channelService.assignAgentsToChannel(farmerId, channelId, agentIds);
        return ResponseEntity.ok(ApiResponse.ok("Agents assigned to channel", Map.of("channel", channel)));
    }

    @DeleteMapping("/channels/{channelId}/agents/{agentId}")
    public ResponseEntity<ApiResponse<Void>> removeAgent(
            @PathVariable Long channelId,
            @PathVariable Long agentId) {
        Long farmerId = SecurityUtils.getCurrentUserId();
        channelService.removeAgentFromChannel(farmerId, channelId, agentId);
        return ResponseEntity.ok(ApiResponse.ok("Agent removed from channel", null));
    }

    @GetMapping("/agents")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAvailableAgents() {
        List<DeliveryAgent> agents = channelService.getAvailableDeliveryAgents();
        return ResponseEntity.ok(ApiResponse.ok("Agents retrieved", Map.of("agents", agents)));
    }

    @PostMapping("/agents")
    public ResponseEntity<ApiResponse<Map<String, Object>>> addNewDeliveryBoy(@RequestBody Map<String, String> body) {
        Long farmerId = SecurityUtils.getCurrentUserId();
        DeliveryAgent agent = channelService.addNewDeliveryBoy(farmerId, body);
        return ResponseEntity.ok(ApiResponse.ok("Delivery agent account created", Map.of("deliveryPartner", agent)));
    }
}

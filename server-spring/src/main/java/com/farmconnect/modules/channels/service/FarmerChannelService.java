package com.farmconnect.modules.channels.service;

import com.farmconnect.common.EmailService;
import com.farmconnect.modules.channels.model.ChannelStatus;
import com.farmconnect.modules.channels.model.FarmerChannel;
import com.farmconnect.modules.channels.repository.FarmerChannelRepository;
import com.farmconnect.modules.delivery.model.DeliveryAgent;
import com.farmconnect.modules.delivery.model.DeliveryAgentStatus;
import com.farmconnect.modules.delivery.repository.DeliveryAgentRepository;
import com.farmconnect.modules.users.model.Role;
import com.farmconnect.modules.users.model.User;
import com.farmconnect.modules.users.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class FarmerChannelService {

    private final FarmerChannelRepository channelRepository;
    private final DeliveryAgentRepository deliveryAgentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public FarmerChannelService(
            FarmerChannelRepository channelRepository,
            DeliveryAgentRepository deliveryAgentRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {
        this.channelRepository = channelRepository;
        this.deliveryAgentRepository = deliveryAgentRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Transactional(readOnly = true)
    public List<FarmerChannel> getChannelsByFarmer(Long farmerId) {
        return channelRepository.findByFarmerId(farmerId);
    }

    @Transactional
    public FarmerChannel createChannel(Long farmerId, String name, String description, BigDecimal fee, BigDecimal threshold) {
        User farmer = userRepository.findById(farmerId)
                .orElseThrow(() -> new IllegalArgumentException("Farmer user not found"));

        FarmerChannel channel = new FarmerChannel();
        channel.setFarmer(farmer);
        channel.setName(name);
        channel.setDescription(description);
        channel.setChannelId("FC-CH-" + (1000 + new Random().nextInt(9000)));
        channel.setDefaultDeliveryFee(fee != null ? fee : new BigDecimal("40.00"));
        channel.setFreeDeliveryThreshold(threshold != null ? threshold : new BigDecimal("499.00"));
        channel.setMaxDeliveryCharge(new BigDecimal("100.00"));
        channel.setStatus(ChannelStatus.ACTIVE);

        return channelRepository.save(channel);
    }

    @Transactional
    public FarmerChannel assignAgentsToChannel(Long farmerId, Long channelId, List<Long> agentIds) {
        FarmerChannel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new IllegalArgumentException("Channel not found"));

        if (!channel.getFarmer().getId().equals(farmerId)) {
            throw new org.springframework.security.access.AccessDeniedException("Only the owning farmer can assign delivery agents");
        }

        for (Long agentId : agentIds) {
            deliveryAgentRepository.findById(agentId).ifPresent(channel::addDeliveryAgent);
        }

        return channelRepository.save(channel);
    }

    @Transactional
    public void removeAgentFromChannel(Long farmerId, Long channelId, Long agentId) {
        FarmerChannel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new IllegalArgumentException("Channel not found"));

        if (!channel.getFarmer().getId().equals(farmerId)) {
            throw new org.springframework.security.access.AccessDeniedException("Only the owning farmer can remove delivery agents");
        }

        deliveryAgentRepository.findById(agentId).ifPresent(channel::removeDeliveryAgent);
        channelRepository.save(channel);
    }

    @Transactional(readOnly = true)
    public List<DeliveryAgent> getAvailableDeliveryAgents() {
        return deliveryAgentRepository.findAll();
    }

    @Transactional
    public DeliveryAgent addNewDeliveryBoy(Long farmerId, Map<String, String> data) {
        String email = data.get("email");
        String mobile = data.get("mobile");
        String fullName = data.get("fullName");

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        String tempPassword = "FC@" + (100000 + new Random().nextInt(900000));

        User user = new User();
        user.setUsername(fullName);
        user.setEmail(email.toLowerCase().trim());
        user.setMobile(mobile);
        user.setPasswordHash(passwordEncoder.encode(tempPassword));
        user.setRole(Role.DELIVERY_PARTNER);
        user.setUserId("DP" + (10000 + new Random().nextInt(90000)));
        user.setIsActive(true);
        user.setIsEmailVerified(false); // sensitive account functionality disabled until verified

        User savedUser = userRepository.save(user);

        DeliveryAgent agent = new DeliveryAgent();
        agent.setUser(savedUser);
        agent.setDeliveryAgentId("DP-" + (1000 + new Random().nextInt(9000)));
        agent.setFullName(fullName);
        agent.setEmail(email);
        agent.setMobile(mobile);
        agent.setAltMobile(data.get("altPhone"));
        agent.setVehicleType(data.getOrDefault("vehicleType", "Electric Cargo Scooter"));
        agent.setServiceArea(data.getOrDefault("city", "Pune Metro"));
        agent.setStatus(DeliveryAgentStatus.PENDING_VERIFICATION);
        agent.setIsVerified(false);

        DeliveryAgent savedAgent = deliveryAgentRepository.save(agent);

        // Send activation email with credentials
        String subject = "Welcome to FarmConnect Delivery Fleet - Verification Required";
        String body = "Dear " + fullName + ",\n\n" +
                "You have been registered as a delivery partner on the FarmConnect Marketplace.\n\n" +
                "Your Temporary Login Details:\n" +
                "Username / Email: " + email + "\n" +
                "Temporary Password: " + tempPassword + "\n\n" +
                "Please log in and update your password upon first access.\n\n" +
                "FarmConnect Dispatch Team";
        emailService.sendEmail(email, subject, body);

        return savedAgent;
    }
}

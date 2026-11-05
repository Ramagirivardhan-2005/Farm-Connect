package com.farmconnect.modules.auth.service;

import com.farmconnect.modules.auth.dto.AuthResponse;
import com.farmconnect.modules.auth.dto.LoginRequest;
import com.farmconnect.modules.auth.dto.SignupRequest;
import com.farmconnect.modules.customers.model.CustomerProfile;
import com.farmconnect.modules.customers.repository.CustomerProfileRepository;
import com.farmconnect.modules.delivery.model.DeliveryAgent;
import com.farmconnect.modules.delivery.model.DeliveryAgentStatus;
import com.farmconnect.modules.delivery.repository.DeliveryAgentRepository;
import com.farmconnect.modules.farmers.model.FarmerProfile;
import com.farmconnect.modules.farmers.repository.FarmerProfileRepository;
import com.farmconnect.modules.users.model.Role;
import com.farmconnect.modules.users.model.User;
import com.farmconnect.modules.users.repository.UserRepository;
import com.farmconnect.modules.wallet.model.Wallet;
import com.farmconnect.modules.wallet.repository.WalletRepository;
import com.farmconnect.security.JwtTokenProvider;
import com.farmconnect.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Random;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final FarmerProfileRepository farmerProfileRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final DeliveryAgentRepository deliveryAgentRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(
            UserRepository userRepository,
            FarmerProfileRepository farmerProfileRepository,
            CustomerProfileRepository customerProfileRepository,
            DeliveryAgentRepository deliveryAgentRepository,
            WalletRepository walletRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.farmerProfileRepository = farmerProfileRepository;
        this.customerProfileRepository = customerProfileRepository;
        this.deliveryAgentRepository = deliveryAgentRepository;
        this.walletRepository = walletRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getLoginId(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String jwt = tokenProvider.generateAccessToken(userPrincipal);

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new IllegalStateException("User not found"));

        AuthResponse.UserDto userDto = new AuthResponse.UserDto(
                user.getId(),
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getMobile(),
                user.getRole(),
                user.getAvatarUrl()
        );

        return new AuthResponse(jwt, userDto);
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("An account with this email address already exists.");
        }
        if (request.getMobile() != null && !request.getMobile().isBlank() && userRepository.existsByMobile(request.getMobile())) {
            throw new IllegalArgumentException("An account with this mobile number already exists.");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setMobile(request.getMobile());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null ? request.getRole() : Role.CUSTOMER);
        user.setUserId("FC" + (100000 + new Random().nextInt(900000)));
        user.setIsActive(true);
        user.setIsEmailVerified(true);
        user.setIsMobileVerified(true);

        User savedUser = userRepository.save(user);

        // Provision specific profile
        if (savedUser.getRole() == Role.FARMER) {
            FarmerProfile farmer = new FarmerProfile();
            farmer.setUser(savedUser);
            farmer.setFarmName(savedUser.getUsername() + "'s Organic Farm");
            farmerProfileRepository.save(farmer);
        } else if (savedUser.getRole() == Role.DELIVERY_PARTNER) {
            DeliveryAgent agent = new DeliveryAgent();
            agent.setUser(savedUser);
            agent.setDeliveryAgentId("DP-" + (1000 + new Random().nextInt(9000)));
            agent.setFullName(savedUser.getUsername());
            agent.setEmail(savedUser.getEmail());
            agent.setMobile(savedUser.getMobile() != null ? savedUser.getMobile() : "+910000000000");
            agent.setStatus(DeliveryAgentStatus.AVAILABLE);
            deliveryAgentRepository.save(agent);
        } else {
            CustomerProfile customer = new CustomerProfile();
            customer.setUser(savedUser);
            customerProfileRepository.save(customer);
        }

        // Initialize wallet with demo starting balance
        Wallet wallet = new Wallet();
        wallet.setUser(savedUser);
        wallet.setBalance(new BigDecimal("500.00"));
        walletRepository.save(wallet);

        UserPrincipal principal = UserPrincipal.create(savedUser);
        String jwt = tokenProvider.generateAccessToken(principal);

        AuthResponse.UserDto userDto = new AuthResponse.UserDto(
                savedUser.getId(),
                savedUser.getUserId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getMobile(),
                savedUser.getRole(),
                savedUser.getAvatarUrl()
        );

        return new AuthResponse(jwt, userDto);
    }
}

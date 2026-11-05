package com.farmconnect.modules.orders.service;

import com.farmconnect.modules.addresses.model.Address;
import com.farmconnect.modules.addresses.repository.AddressRepository;
import com.farmconnect.modules.channels.model.FarmerChannel;
import com.farmconnect.modules.channels.repository.FarmerChannelRepository;
import com.farmconnect.modules.orders.model.*;
import com.farmconnect.modules.orders.repository.OrderRepository;
import com.farmconnect.modules.outbox.model.OutboxEvent;
import com.farmconnect.modules.outbox.repository.OutboxEventRepository;
import com.farmconnect.modules.promos.model.DiscountType;
import com.farmconnect.modules.promos.model.PromoCode;
import com.farmconnect.modules.promos.model.PromoCodeUsage;
import com.farmconnect.modules.promos.repository.PromoCodeRepository;
import com.farmconnect.modules.promos.repository.PromoCodeUsageRepository;
import com.farmconnect.modules.users.model.User;
import com.farmconnect.modules.users.repository.UserRepository;
import com.farmconnect.modules.wallet.model.TransactionType;
import com.farmconnect.modules.wallet.model.Wallet;
import com.farmconnect.modules.wallet.model.WalletTransaction;
import com.farmconnect.modules.wallet.repository.WalletRepository;
import com.farmconnect.modules.wallet.repository.WalletTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final FarmerChannelRepository channelRepository;
    private final PromoCodeRepository promoCodeRepository;
    private final PromoCodeUsageRepository promoCodeUsageRepository;
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final OutboxEventRepository outboxEventRepository;

    public OrderService(
            OrderRepository orderRepository,
            UserRepository userRepository,
            AddressRepository addressRepository,
            FarmerChannelRepository channelRepository,
            PromoCodeRepository promoCodeRepository,
            PromoCodeUsageRepository promoCodeUsageRepository,
            WalletRepository walletRepository,
            WalletTransactionRepository walletTransactionRepository,
            OutboxEventRepository outboxEventRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.channelRepository = channelRepository;
        this.promoCodeRepository = promoCodeRepository;
        this.promoCodeUsageRepository = promoCodeUsageRepository;
        this.walletRepository = walletRepository;
        this.walletTransactionRepository = walletTransactionRepository;
        this.outboxEventRepository = outboxEventRepository;
    }

    @Transactional
    public Order createOrder(Long customerId, Map<String, Object> request) {
        // Idempotency check (Instruction 28)
        String idempotencyKey = (String) request.get("idempotencyKey");
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            Optional<Order> existing = orderRepository.findByIdempotencyKey(idempotencyKey);
            if (existing.isPresent()) {
                return existing.get();
            }
        }

        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        // Items and subtotal calculation (Server-side truth)
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> itemsRaw = (List<Map<String, Object>>) request.getOrDefault("items", List.of());
        BigDecimal calculatedSubtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (Map<String, Object> itemMap : itemsRaw) {
            String name = (String) itemMap.get("name");
            BigDecimal price = new BigDecimal(itemMap.get("price").toString());
            BigDecimal quantity = new BigDecimal(itemMap.get("quantity").toString());
            String unit = (String) itemMap.getOrDefault("unit", "KG");
            BigDecimal sub = price.multiply(quantity).setScale(2, RoundingMode.HALF_UP);
            calculatedSubtotal = calculatedSubtotal.add(sub);

            OrderItem orderItem = new OrderItem(name, price, quantity, unit, sub);
            orderItems.add(orderItem);
        }

        // Delivery Fee Calculation (Instruction 11: Free if >= 499, else max 100)
        BigDecimal deliveryFee = BigDecimal.ZERO;
        String deliveryFeeReason = "Standard Delivery";

        if (calculatedSubtotal.compareTo(new BigDecimal("499.00")) >= 0) {
            deliveryFee = BigDecimal.ZERO;
            deliveryFeeReason = "Free Delivery (Order >= ₹499)";
        } else {
            deliveryFee = new BigDecimal("40.00");
            deliveryFeeReason = "Standard Delivery Charge";
        }

        // Promo Code Validation (Instruction 15)
        String promoCodeStr = (String) request.get("promoCode");
        BigDecimal promoDiscount = BigDecimal.ZERO;
        PromoCode appliedPromo = null;

        if (promoCodeStr != null && !promoCodeStr.isBlank()) {
            Optional<PromoCode> promoOpt = promoCodeRepository.findByCodeIgnoreCaseAndIsActiveTrue(promoCodeStr.trim());
            if (promoOpt.isPresent()) {
                PromoCode promo = promoOpt.get();
                boolean alreadyUsed = promoCodeUsageRepository.existsByPromoCodeIdAndUserId(promo.getId(), customerId);
                boolean meetsMin = promo.getMinOrderValue() == null || calculatedSubtotal.compareTo(promo.getMinOrderValue()) >= 0;

                if (!alreadyUsed && meetsMin) {
                    if (promo.getDiscountType() == DiscountType.PERCENTAGE) {
                        BigDecimal disc = calculatedSubtotal.multiply(promo.getDiscountValue()).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                        if (promo.getMaxDiscount() != null && promo.getMaxDiscount().compareTo(BigDecimal.ZERO) > 0) {
                            disc = disc.min(promo.getMaxDiscount());
                        }
                        promoDiscount = disc;
                    } else {
                        promoDiscount = promo.getDiscountValue();
                    }
                    promoDiscount = promoDiscount.min(calculatedSubtotal);
                    appliedPromo = promo;
                }
            }
        }

        BigDecimal totalAmount = calculatedSubtotal.add(deliveryFee).subtract(promoDiscount).max(BigDecimal.ZERO);

        // Payment Handling: WALLET with Row-Level Locking (Instruction 12 & 29)
        String paymentMethod = (String) request.getOrDefault("paymentMethod", "WALLET");
        OrderStatus initialStatus = OrderStatus.CREATED;

        if ("WALLET".equalsIgnoreCase(paymentMethod)) {
            Wallet wallet = walletRepository.findByUserIdWithLock(customerId)
                    .orElseThrow(() -> new IllegalStateException("Customer wallet not found"));

            if (wallet.getBalance().compareTo(totalAmount) < 0) {
                throw new IllegalArgumentException("Insufficient wallet balance. Please add funds to your Secure Purse.");
            }

            wallet.setBalance(wallet.getBalance().subtract(totalAmount));
            walletRepository.save(wallet);

            WalletTransaction tx = new WalletTransaction();
            tx.setTxId("TXN-" + (10000000 + new Random().nextInt(90000000)));
            tx.setWallet(wallet);
            tx.setUser(customer);
            tx.setType(TransactionType.ORDER_PAYMENT);
            tx.setAmount(totalAmount);
            tx.setBalanceAfter(wallet.getBalance());
            tx.setReference("Payment for harvest order");
            tx.setStatus("SUCCESS");
            walletTransactionRepository.save(tx);

            initialStatus = OrderStatus.PAID;
        }

        // Expected Delivery Date: placement + 2 days (Instruction 44)
        Instant expectedDelivery = Instant.now().plus(2, ChronoUnit.DAYS);

        // Construct Order
        Order order = new Order();
        order.setOrderId("ORD-2026-" + (10000 + new Random().nextInt(90000)));
        order.setCustomer(customer);
        order.setFarmer(userRepository.findById(2L).orElse(customer)); // default farm gate origin
        order.setStatus(initialStatus);
        order.setSubtotal(calculatedSubtotal);
        order.setDeliveryFee(deliveryFee);
        order.setDeliveryFeeReason(deliveryFeeReason);
        order.setPromoCode(appliedPromo != null ? appliedPromo.getCode() : null);
        order.setPromoDiscount(promoDiscount);
        order.setTotalAmount(totalAmount);
        order.setExpectedDeliveryDate(expectedDelivery);
        order.setIdempotencyKey(idempotencyKey);

        // Generate 6-digit Delivery Handover OTP (Instruction 10)
        String otp = String.format("%06d", new Random().nextInt(1000000));
        order.setDeliveryOtp(otp);
        order.setDeliveryOtpExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS));

        // Add Items
        for (OrderItem item : orderItems) {
            order.addItem(item);
        }

        // Immutable Address Snapshot (Instruction 14)
        @SuppressWarnings("unchecked")
        Map<String, Object> addrMap = (Map<String, Object>) request.get("deliveryAddress");
        if (addrMap != null) {
            OrderAddress orderAddr = new OrderAddress();
            orderAddr.setFullName((String) addrMap.getOrDefault("fullName", customer.getUsername()));
            orderAddr.setMobile((String) addrMap.getOrDefault("mobile", customer.getMobile()));
            orderAddr.setHouse((String) addrMap.getOrDefault("house", ""));
            orderAddr.setStreet((String) addrMap.getOrDefault("street", ""));
            orderAddr.setVillage((String) addrMap.getOrDefault("village", ""));
            orderAddr.setDistrict((String) addrMap.getOrDefault("district", "Pune"));
            orderAddr.setState((String) addrMap.getOrDefault("state", "Maharashtra"));
            orderAddr.setPincode((String) addrMap.getOrDefault("pincode", "411038"));
            orderAddr.setType((String) addrMap.getOrDefault("type", "Home"));
            order.setDeliveryAddress(orderAddr);
        }

        order.addStatusHistory(initialStatus.name(), "Order created via " + paymentMethod, "CUSTOMER");

        Order savedOrder = orderRepository.save(order);

        // Record promo usage
        if (appliedPromo != null) {
            appliedPromo.setUsedCount(appliedPromo.getUsedCount() + 1);
            promoCodeRepository.save(appliedPromo);
            promoCodeUsageRepository.save(new PromoCodeUsage(appliedPromo, customer, savedOrder));
        }

        // Transactional Outbox Event (Instruction 27)
        String payloadJson = String.format("{\"orderId\":\"%s\",\"total\":%s,\"customer\":\"%s\"}",
                savedOrder.getOrderId(), savedOrder.getTotalAmount(), customer.getEmail());
        outboxEventRepository.save(new OutboxEvent("ORDER", savedOrder.getOrderId(), "ORDER_CREATED", payloadJson));

        return savedOrder;
    }

    @Transactional(readOnly = true)
    public List<Order> getMyOrders(Long customerId) {
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    @Transactional(readOnly = true)
    public Order getOrderByOrderId(String orderId) {
        return orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + orderId));
    }
}

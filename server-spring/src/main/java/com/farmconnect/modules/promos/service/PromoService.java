package com.farmconnect.modules.promos.service;

import com.farmconnect.modules.promos.model.DiscountType;
import com.farmconnect.modules.promos.model.PromoCode;
import com.farmconnect.modules.promos.repository.PromoCodeRepository;
import com.farmconnect.modules.promos.repository.PromoCodeUsageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class PromoService {

    private final PromoCodeRepository promoCodeRepository;
    private final PromoCodeUsageRepository usageRepository;

    public PromoService(PromoCodeRepository promoCodeRepository, PromoCodeUsageRepository usageRepository) {
        this.promoCodeRepository = promoCodeRepository;
        this.usageRepository = usageRepository;
    }

    @Transactional(readOnly = true)
    public List<PromoCode> getActivePromos() {
        return promoCodeRepository.findByIsActiveTrue();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> validatePromo(Long userId, String code, BigDecimal orderAmount) {
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Promo code cannot be empty");
        }

        PromoCode promo = promoCodeRepository.findByCodeIgnoreCaseAndIsActiveTrue(code.trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired promo code"));

        Instant now = Instant.now();
        if (promo.getValidFrom() != null && now.isBefore(promo.getValidFrom())) {
            throw new IllegalArgumentException("This promo code is not active yet");
        }
        if (promo.getValidUntil() != null && now.isAfter(promo.getValidUntil())) {
            throw new IllegalArgumentException("This promo code has expired");
        }
        if (promo.getUsageLimit() != null && promo.getUsedCount() >= promo.getUsageLimit()) {
            throw new IllegalArgumentException("This promo code has reached its usage limit");
        }
        if (promo.getMinOrderValue() != null && orderAmount.compareTo(promo.getMinOrderValue()) < 0) {
            throw new IllegalArgumentException("Minimum order of ₹" + promo.getMinOrderValue() + " required");
        }
        if (userId != null && usageRepository.existsByPromoCodeIdAndUserId(promo.getId(), userId)) {
            throw new IllegalArgumentException("You have already used this promo code");
        }

        BigDecimal discount;
        if (promo.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = orderAmount.multiply(promo.getDiscountValue()).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            if (promo.getMaxDiscount() != null && promo.getMaxDiscount().compareTo(BigDecimal.ZERO) > 0) {
                discount = discount.min(promo.getMaxDiscount());
            }
        } else {
            discount = promo.getDiscountValue();
        }
        discount = discount.min(orderAmount);

        return Map.of(
                "success", true,
                "promoCode", promo.getCode(),
                "discount", discount.setScale(0, RoundingMode.HALF_UP).intValue(),
                "description", promo.getDescription() != null ? promo.getDescription() : "Discount applied",
                "discountType", promo.getDiscountType().name(),
                "discountValue", promo.getDiscountValue()
        );
    }
}

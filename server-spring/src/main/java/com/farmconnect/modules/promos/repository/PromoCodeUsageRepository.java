package com.farmconnect.modules.promos.repository;

import com.farmconnect.modules.promos.model.PromoCodeUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PromoCodeUsageRepository extends JpaRepository<PromoCodeUsage, Long> {
    boolean existsByPromoCodeIdAndUserId(Long promoCodeId, Long userId);
    Optional<PromoCodeUsage> findByPromoCodeIdAndUserId(Long promoCodeId, Long userId);
}

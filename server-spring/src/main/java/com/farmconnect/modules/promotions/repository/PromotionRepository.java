package com.farmconnect.modules.promotions.repository;

import com.farmconnect.modules.promotions.model.Promotion;
import com.farmconnect.modules.promotions.model.PromotionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    List<Promotion> findByFarmerId(Long farmerId);
    List<Promotion> findByStatus(PromotionStatus status);
    Optional<Promotion> findByPromoId(String promoId);
}

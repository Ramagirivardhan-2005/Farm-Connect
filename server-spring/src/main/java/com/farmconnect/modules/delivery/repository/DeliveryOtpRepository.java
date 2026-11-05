package com.farmconnect.modules.delivery.repository;

import com.farmconnect.modules.delivery.model.DeliveryOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DeliveryOtpRepository extends JpaRepository<DeliveryOtp, Long> {
    Optional<DeliveryOtp> findFirstByOrderIdOrderByCreatedAtDesc(Long orderId);
}

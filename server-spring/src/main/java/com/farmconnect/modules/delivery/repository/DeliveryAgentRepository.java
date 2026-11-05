package com.farmconnect.modules.delivery.repository;

import com.farmconnect.modules.delivery.model.DeliveryAgent;
import com.farmconnect.modules.delivery.model.DeliveryAgentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryAgentRepository extends JpaRepository<DeliveryAgent, Long> {
    Optional<DeliveryAgent> findByDeliveryAgentId(String deliveryAgentId);
    Optional<DeliveryAgent> findByUserId(Long userId);
    List<DeliveryAgent> findByStatus(DeliveryAgentStatus status);

    @Query("SELECT da FROM DeliveryAgent da JOIN da.channels ch WHERE ch.id = :channelId")
    List<DeliveryAgent> findByChannelId(@Param("channelId") Long channelId);
}

package com.farmconnect.modules.channels.repository;

import com.farmconnect.modules.channels.model.FarmerChannel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FarmerChannelRepository extends JpaRepository<FarmerChannel, Long> {
    List<FarmerChannel> findByFarmerId(Long farmerId);
    Optional<FarmerChannel> findByChannelId(String channelId);

    @Query("SELECT ch FROM FarmerChannel ch JOIN ch.deliveryAgents da WHERE da.id = :agentId")
    List<FarmerChannel> findByDeliveryAgentId(@Param("agentId") Long agentId);
}

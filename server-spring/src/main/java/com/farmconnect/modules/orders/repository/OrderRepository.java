package com.farmconnect.modules.orders.repository;

import com.farmconnect.modules.orders.model.Order;
import com.farmconnect.modules.orders.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderId(String orderId);
    Optional<Order> findByIdempotencyKey(String idempotencyKey);
    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    long countByCustomerId(Long customerId);
    List<Order> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);
    List<Order> findByDeliveryAgentIdOrderByCreatedAtDesc(Long deliveryAgentId);
    Optional<Order> findFirstByDeliveryAgentIdAndStatusIn(Long deliveryAgentId, List<OrderStatus> statuses);

    // Delivery Agent pickup search: find orders whose delivery channel is assigned to the agent
    @Query("SELECT o FROM Order o " +
           "JOIN o.deliveryChannel ch " +
           "JOIN ch.deliveryAgents da " +
           "WHERE da.id = :agentId AND o.status = :status AND o.deliveryAgent IS NULL " +
           "ORDER BY o.createdAt ASC")
    List<Order> findAvailableOrdersForAgent(@Param("agentId") Long agentId, @Param("status") OrderStatus status);

    // Concurrency Protection (Instruction 30): Atomic order acceptance
    @Modifying
    @Query("UPDATE Order o SET o.deliveryAgent.id = :agentId, o.status = :acceptedStatus " +
           "WHERE o.id = :orderId AND o.status = :availableStatus AND o.deliveryAgent IS NULL")
    int claimOrderAtomically(
        @Param("orderId") Long orderId,
        @Param("agentId") Long agentId,
        @Param("availableStatus") OrderStatus availableStatus,
        @Param("acceptedStatus") OrderStatus acceptedStatus
    );
}

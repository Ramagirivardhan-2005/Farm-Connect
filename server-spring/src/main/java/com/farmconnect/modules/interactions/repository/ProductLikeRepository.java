package com.farmconnect.modules.interactions.repository;

import com.farmconnect.modules.interactions.model.ProductLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductLikeRepository extends JpaRepository<ProductLike, Long> {
    boolean existsByProductIdAndUserId(Long productId, Long userId);
    Optional<ProductLike> findByProductIdAndUserId(Long productId, Long userId);
    long countByProductId(Long productId);
    List<ProductLike> findByUserId(Long userId);
}

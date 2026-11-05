package com.farmconnect.modules.products.repository;

import com.farmconnect.modules.products.model.ProductShare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductShareRepository extends JpaRepository<ProductShare, Long> {
    long countByProductId(Long productId);
}

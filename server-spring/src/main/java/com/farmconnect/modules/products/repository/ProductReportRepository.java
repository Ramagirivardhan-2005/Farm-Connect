package com.farmconnect.modules.products.repository;

import com.farmconnect.modules.products.model.ProductReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductReportRepository extends JpaRepository<ProductReport, Long> {
    List<ProductReport> findByProductId(Long productId);
    long countByProductId(Long productId);
}

package com.farmconnect.modules.products.repository;

import com.farmconnect.modules.products.model.ProductComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductCommentRepository extends JpaRepository<ProductComment, Long> {

    Page<ProductComment> findByProductIdAndParentCommentIsNullAndStatus(Long productId, String status, Pageable pageable);

    Page<ProductComment> findByParentCommentIdAndStatus(Long parentCommentId, String status, Pageable pageable);

    List<ProductComment> findByParentCommentIdAndStatusOrderByCreatedAtAsc(Long parentCommentId, String status);

    long countByProductIdAndStatus(Long productId, String status);

    long countByParentCommentIdAndStatus(Long parentCommentId, String status);
}

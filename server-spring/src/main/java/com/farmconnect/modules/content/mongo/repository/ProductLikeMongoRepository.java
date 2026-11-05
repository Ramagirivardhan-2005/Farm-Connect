package com.farmconnect.modules.content.mongo.repository;

import com.farmconnect.modules.content.mongo.model.ProductLikeDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductLikeMongoRepository extends MongoRepository<ProductLikeDocument, String> {

    Optional<ProductLikeDocument> findByProductIdAndUserId(Long productId, Long userId);

    boolean existsByProductIdAndUserId(Long productId, Long userId);

    long countByProductId(Long productId);

    void deleteByProductIdAndUserId(Long productId, Long userId);

    List<ProductLikeDocument> findByUserId(Long userId);
}

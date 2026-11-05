package com.farmconnect.modules.content.mongo.repository;

import com.farmconnect.modules.content.mongo.model.UserInteractionDocument;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserInteractionMongoRepository extends MongoRepository<UserInteractionDocument, String> {

    List<UserInteractionDocument> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<UserInteractionDocument> findByUserIdAndInteractionTypeOrderByCreatedAtDesc(
        Long userId, String interactionType, Pageable pageable
    );

    long countByUserIdAndInteractionType(Long userId, String interactionType);
}

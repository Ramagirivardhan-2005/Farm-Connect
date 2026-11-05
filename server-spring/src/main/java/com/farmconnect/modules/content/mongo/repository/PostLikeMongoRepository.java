package com.farmconnect.modules.content.mongo.repository;

import com.farmconnect.modules.content.mongo.model.PostLikeDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostLikeMongoRepository extends MongoRepository<PostLikeDocument, String> {

    Optional<PostLikeDocument> findByPostIdAndUserId(String postId, Long userId);

    boolean existsByPostIdAndUserId(String postId, Long userId);

    long countByPostId(String postId);

    void deleteByPostIdAndUserId(String postId, Long userId);
}

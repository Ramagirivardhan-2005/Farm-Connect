package com.farmconnect.modules.content.mongo.repository;

import com.farmconnect.modules.content.mongo.model.PostDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface PostMongoRepository extends MongoRepository<PostDocument, String> {

    Optional<PostDocument> findByPostId(String postId);

    Page<PostDocument> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    Page<PostDocument> findByChannelIdAndStatusOrderByCreatedAtDesc(Long channelId, String status, Pageable pageable);

    Page<PostDocument> findByFarmerIdAndStatusOrderByCreatedAtDesc(Long farmerId, String status, Pageable pageable);

    List<PostDocument> findTop5ByFarmerIdAndProductIdAndCreatedAtAfterOrderByCreatedAtDesc(
        Long farmerId, Long productId, Instant after
    );
}

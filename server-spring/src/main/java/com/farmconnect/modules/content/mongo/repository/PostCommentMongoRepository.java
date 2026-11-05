package com.farmconnect.modules.content.mongo.repository;

import com.farmconnect.modules.content.mongo.model.PostCommentDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostCommentMongoRepository extends MongoRepository<PostCommentDocument, String> {

    Page<PostCommentDocument> findByPostIdAndStatusOrderByCreatedAtDesc(String postId, String status, Pageable pageable);

    List<PostCommentDocument> findByParentCommentIdAndStatusOrderByCreatedAtAsc(String parentCommentId, String status);

    long countByPostIdAndStatus(String postId, String status);
}

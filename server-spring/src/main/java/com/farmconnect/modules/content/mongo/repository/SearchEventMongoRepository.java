package com.farmconnect.modules.content.mongo.repository;

import com.farmconnect.modules.content.mongo.model.SearchEventDocument;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SearchEventMongoRepository extends MongoRepository<SearchEventDocument, String> {

    List<SearchEventDocument> findTop20ByOrderByCreatedAtDesc();

    List<SearchEventDocument> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}

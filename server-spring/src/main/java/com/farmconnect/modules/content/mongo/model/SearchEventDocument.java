package com.farmconnect.modules.content.mongo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "search_events")
@CompoundIndex(name = "query_created_idx", def = "{'query': 1, 'createdAt': -1}")
public class SearchEventDocument {

    @Id
    private String id;

    @Indexed
    private Long userId;

    @Indexed
    private String query;

    private Integer resultsCount = 0;
    private Instant createdAt = Instant.now();

    public SearchEventDocument() {}

    public SearchEventDocument(Long userId, String query, Integer resultsCount) {
        this.userId = userId;
        this.query = query;
        this.resultsCount = resultsCount;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }

    public Integer getResultsCount() { return resultsCount; }
    public void setResultsCount(Integer resultsCount) { this.resultsCount = resultsCount; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

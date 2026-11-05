package com.farmconnect.modules.content.mongo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "post_likes")
@CompoundIndex(name = "unique_post_user_like", def = "{'postId': 1, 'userId': 1}", unique = true)
public class PostLikeDocument {

    @Id
    private String id;
    private String postId;
    private Long userId;
    private Instant createdAt = Instant.now();

    public PostLikeDocument() {}

    public PostLikeDocument(String postId, Long userId) {
        this.postId = postId;
        this.userId = userId;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPostId() { return postId; }
    public void setPostId(String postId) { this.postId = postId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

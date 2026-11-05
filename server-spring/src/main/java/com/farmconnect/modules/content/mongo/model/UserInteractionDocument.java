package com.farmconnect.modules.content.mongo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Document(collection = "user_interactions")
@CompoundIndex(name = "user_type_created_idx", def = "{'userId': 1, 'interactionType': 1, 'createdAt': -1}")
public class UserInteractionDocument {

    @Id
    private String id;

    @Indexed
    private Long userId;

    @Indexed
    private String interactionType;

    @Indexed
    private String targetId;

    private String targetType;
    private Map<String, Object> metadata = new HashMap<>();
    private Instant createdAt = Instant.now();

    public UserInteractionDocument() {}

    public UserInteractionDocument(Long userId, String interactionType, String targetId, String targetType) {
        this.userId = userId;
        this.interactionType = interactionType;
        this.targetId = targetId;
        this.targetType = targetType;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getInteractionType() { return interactionType; }
    public void setInteractionType(String interactionType) { this.interactionType = interactionType; }

    public String getTargetId() { return targetId; }
    public void setTargetId(String targetId) { this.targetId = targetId; }

    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }

    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

package com.farmconnect.modules.interactions.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "user_interactions", indexes = {
    @Index(name = "idx_ui_user_event", columnList = "user_id, event_type, created_at"),
    @Index(name = "idx_ui_target", columnList = "target_type, target_id")
})
public class UserInteraction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "session_id", length = 100)
    private String sessionId;

    @Column(name = "target_type", nullable = false, length = 30)
    private String targetType;

    @Column(name = "target_id")
    private Long targetId;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;

    @Column(name = "query_text")
    private String queryText;

    @Column(columnDefinition = "JSON")
    private String metadata;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public UserInteraction() {}

    public UserInteraction(Long userId, String sessionId, String targetType, Long targetId, String eventType, String queryText) {
        this.userId = userId;
        this.sessionId = sessionId;
        this.targetType = targetType;
        this.targetId = targetId;
        this.eventType = eventType;
        this.queryText = queryText;
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }

    public Long getTargetId() { return targetId; }
    public void setTargetId(Long targetId) { this.targetId = targetId; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getQueryText() { return queryText; }
    public void setQueryText(String queryText) { this.queryText = queryText; }

    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

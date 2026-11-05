package com.farmconnect.modules.content.mongo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "product_likes")
@CompoundIndex(name = "unique_product_user_like", def = "{'productId': 1, 'userId': 1}", unique = true)
public class ProductLikeDocument {

    @Id
    private String id;
    private Long productId;
    private Long userId;
    private Instant createdAt = Instant.now();

    public ProductLikeDocument() {}

    public ProductLikeDocument(Long productId, Long userId) {
        this.productId = productId;
        this.userId = userId;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

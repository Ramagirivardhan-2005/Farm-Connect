package com.farmconnect.modules.products.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.farmconnect.modules.users.model.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "product_shares")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ProductShare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 50)
    private String platform = "COPY_LINK";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public ProductShare() {}

    public ProductShare(Product product, User user, String platform) {
        this.product = product;
        this.user = user;
        this.platform = platform != null ? platform : "COPY_LINK";
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

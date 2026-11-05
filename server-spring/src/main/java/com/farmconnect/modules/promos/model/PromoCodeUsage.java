package com.farmconnect.modules.promos.model;

import com.farmconnect.modules.orders.model.Order;
import com.farmconnect.modules.users.model.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "promo_code_usage", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"promo_code_id", "user_id"})
})
public class PromoCodeUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promo_code_id", nullable = false)
    private PromoCode promoCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(name = "used_at", nullable = false, updatable = false)
    private Instant usedAt = Instant.now();

    public PromoCodeUsage() {}

    public PromoCodeUsage(PromoCode promoCode, User user, Order order) {
        this.promoCode = promoCode;
        this.user = user;
        this.order = order;
        this.usedAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public PromoCode getPromoCode() { return promoCode; }
    public void setPromoCode(PromoCode promoCode) { this.promoCode = promoCode; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public Instant getUsedAt() { return usedAt; }
    public void setUsedAt(Instant usedAt) { this.usedAt = usedAt; }
}

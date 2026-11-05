package com.farmconnect.modules.channels.model;

import com.farmconnect.modules.delivery.model.DeliveryAgent;
import com.farmconnect.modules.users.model.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "farmer_channels")
public class FarmerChannel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "channel_id", nullable = false, unique = true, length = 50)
    private String channelId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private User farmer;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "default_delivery_fee", nullable = false, precision = 8, scale = 2)
    private BigDecimal defaultDeliveryFee = new BigDecimal("40.00");

    @Column(name = "free_delivery_threshold", nullable = false, precision = 8, scale = 2)
    private BigDecimal freeDeliveryThreshold = new BigDecimal("499.00");

    @Column(name = "max_delivery_charge", nullable = false, precision = 8, scale = 2)
    private BigDecimal maxDeliveryCharge = new BigDecimal("100.00");

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ChannelStatus status = ChannelStatus.ACTIVE;

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "channel_delivery_agents",
        joinColumns = @JoinColumn(name = "channel_id"),
        inverseJoinColumns = @JoinColumn(name = "delivery_agent_id")
    )
    private Set<DeliveryAgent> deliveryAgents = new HashSet<>();

    @Column(name = "banner_image", length = 500)
    private String bannerImage;

    @Column(name = "logo_image", length = 500)
    private String logoImage;

    @Column(name = "follower_count", nullable = false)
    private Integer followerCount = 1200;

    @Column(name = "like_count", nullable = false)
    private Integer likeCount = 850;

    @Column(precision = 10, scale = 8)
    private BigDecimal latitude = new BigDecimal("18.52040000");

    @Column(precision = 11, scale = 8)
    private BigDecimal longitude = new BigDecimal("73.85670000");

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public String getBannerImage() { return bannerImage; }
    public void setBannerImage(String bannerImage) { this.bannerImage = bannerImage; }

    public String getLogoImage() { return logoImage; }
    public void setLogoImage(String logoImage) { this.logoImage = logoImage; }

    public Integer getFollowerCount() { return followerCount; }
    public void setFollowerCount(Integer followerCount) { this.followerCount = followerCount; }

    public Integer getLikeCount() { return likeCount; }
    public void setLikeCount(Integer likeCount) { this.likeCount = likeCount; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

    public FarmerChannel() {}

    // Convenience helpers
    public void addDeliveryAgent(DeliveryAgent agent) {
        this.deliveryAgents.add(agent);
        agent.getChannels().add(this);
    }

    public void removeDeliveryAgent(DeliveryAgent agent) {
        this.deliveryAgents.remove(agent);
        agent.getChannels().remove(this);
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getChannelId() { return channelId; }
    public void setChannelId(String channelId) { this.channelId = channelId; }

    public User getFarmer() { return farmer; }
    public void setFarmer(User farmer) { this.farmer = farmer; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getDefaultDeliveryFee() { return defaultDeliveryFee; }
    public void setDefaultDeliveryFee(BigDecimal defaultDeliveryFee) { this.defaultDeliveryFee = defaultDeliveryFee; }

    public BigDecimal getFreeDeliveryThreshold() { return freeDeliveryThreshold; }
    public void setFreeDeliveryThreshold(BigDecimal freeDeliveryThreshold) { this.freeDeliveryThreshold = freeDeliveryThreshold; }

    public BigDecimal getMaxDeliveryCharge() { return maxDeliveryCharge; }
    public void setMaxDeliveryCharge(BigDecimal maxDeliveryCharge) { this.maxDeliveryCharge = maxDeliveryCharge; }

    public ChannelStatus getStatus() { return status; }
    public void setStatus(ChannelStatus status) { this.status = status; }

    public Set<DeliveryAgent> getDeliveryAgents() { return deliveryAgents; }
    public void setDeliveryAgents(Set<DeliveryAgent> deliveryAgents) { this.deliveryAgents = deliveryAgents; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

package com.farmconnect.modules.delivery.model;

import com.farmconnect.modules.channels.model.FarmerChannel;
import com.farmconnect.modules.users.model.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "delivery_agents")
public class DeliveryAgent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "delivery_agent_id", nullable = false, unique = true, length = 50)
    private String deliveryAgentId;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(nullable = false, length = 20)
    private String mobile;

    @Column(name = "alt_mobile", length = 20)
    private String altMobile;

    @Column(name = "vehicle_type", length = 100)
    private String vehicleType = "Electric Cargo Scooter";

    @Column(name = "vehicle_number", length = 50)
    private String vehicleNumber;

    @Column(name = "service_area", length = 200)
    private String serviceArea;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DeliveryAgentStatus status = DeliveryAgentStatus.AVAILABLE;

    @Column(precision = 3, scale = 2)
    private BigDecimal rating = new BigDecimal("5.00");

    @Column(name = "total_deliveries", nullable = false)
    private Integer totalDeliveries = 0;

    @Column(name = "active_deliveries", nullable = false)
    private Integer activeDeliveries = 0;

    @Column(name = "today_earnings", precision = 10, scale = 2)
    private BigDecimal todayEarnings = BigDecimal.ZERO;

    @Column(name = "lifetime_earnings", precision = 12, scale = 2)
    private BigDecimal lifetimeEarnings = BigDecimal.ZERO;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "bank_account", length = 50)
    private String bankAccount;

    @Column(name = "bank_ifsc", length = 30)
    private String bankIfsc;

    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;

    @JsonIgnore
    @ManyToMany(mappedBy = "deliveryAgents", fetch = FetchType.LAZY)
    private Set<FarmerChannel> channels = new HashSet<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public DeliveryAgent() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getDeliveryAgentId() { return deliveryAgentId; }
    public void setDeliveryAgentId(String deliveryAgentId) { this.deliveryAgentId = deliveryAgentId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getAltMobile() { return altMobile; }
    public void setAltMobile(String altMobile) { this.altMobile = altMobile; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public String getServiceArea() { return serviceArea; }
    public void setServiceArea(String serviceArea) { this.serviceArea = serviceArea; }

    public DeliveryAgentStatus getStatus() { return status; }
    public void setStatus(DeliveryAgentStatus status) { this.status = status; }

    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }

    public Integer getTotalDeliveries() { return totalDeliveries; }
    public void setTotalDeliveries(Integer totalDeliveries) { this.totalDeliveries = totalDeliveries; }

    public Integer getActiveDeliveries() { return activeDeliveries; }
    public void setActiveDeliveries(Integer activeDeliveries) { this.activeDeliveries = activeDeliveries; }

    public BigDecimal getTodayEarnings() { return todayEarnings; }
    public void setTodayEarnings(BigDecimal todayEarnings) { this.todayEarnings = todayEarnings; }

    public BigDecimal getLifetimeEarnings() { return lifetimeEarnings; }
    public void setLifetimeEarnings(BigDecimal lifetimeEarnings) { this.lifetimeEarnings = lifetimeEarnings; }

    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }

    public String getBankAccount() { return bankAccount; }
    public void setBankAccount(String bankAccount) { this.bankAccount = bankAccount; }

    public String getBankIfsc() { return bankIfsc; }
    public void setBankIfsc(String bankIfsc) { this.bankIfsc = bankIfsc; }

    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean verified) { isVerified = verified; }

    public Set<FarmerChannel> getChannels() { return channels; }
    public void setChannels(Set<FarmerChannel> channels) { this.channels = channels; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

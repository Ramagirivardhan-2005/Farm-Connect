package com.farmconnect.modules.orders.model;

public enum OrderStatus {
    CREATED,
    PAID,
    ACCEPTED,
    PROCESSING,
    PACKED,
    READY_FOR_PICKUP,
    PICKED_UP,
    IN_TRANSIT,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED,
    FAILED
}

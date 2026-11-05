package com.farmconnect.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaRepositories(basePackages = {
    "com.farmconnect.modules.users.repository",
    "com.farmconnect.modules.farmers.repository",
    "com.farmconnect.modules.customers.repository",
    "com.farmconnect.modules.delivery.repository",
    "com.farmconnect.modules.channels.repository",
    "com.farmconnect.modules.products.repository",
    "com.farmconnect.modules.addresses.repository",
    "com.farmconnect.modules.orders.repository",
    "com.farmconnect.modules.wallet.repository",
    "com.farmconnect.modules.payments.repository",
    "com.farmconnect.modules.promos.repository",
    "com.farmconnect.modules.promotions.repository",
    "com.farmconnect.modules.subscriptions.repository",
    "com.farmconnect.modules.notifications.repository",
    "com.farmconnect.modules.outbox.repository",
    "com.farmconnect.modules.posts.repository",
    "com.farmconnect.modules.interactions.repository",
    "com.farmconnect.modules.wishlist"
})
public class JpaConfig {
}

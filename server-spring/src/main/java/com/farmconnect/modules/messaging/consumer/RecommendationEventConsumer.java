package com.farmconnect.modules.messaging.consumer;

import com.farmconnect.modules.cache.service.RedisCacheService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@ConditionalOnProperty(name = "farmconnect.rabbitmq.enabled", havingValue = "true")
public class RecommendationEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(RecommendationEventConsumer.class);

    private final RedisCacheService redisCacheService;

    public RecommendationEventConsumer(RedisCacheService redisCacheService) {
        this.redisCacheService = redisCacheService;
    }

    @RabbitListener(queues = "farmconnect.recommendation.queue")
    public void handleRecommendationUpdate(Map<String, Object> message) {
        log.info("RabbitMQ Recommendation Worker received cache invalidation/refresh event: {}", message);
        try {
            if (message.containsKey("productId")) {
                Long productId = Long.valueOf(message.get("productId").toString());
                redisCacheService.invalidateProductCache(productId);
                log.info("Product and Popular Redis caches invalidated for productId={}", productId);
            }
            if (message.containsKey("channelId")) {
                Long channelId = Long.valueOf(message.get("channelId").toString());
                redisCacheService.invalidateChannelCache(channelId);
                log.info("Channel Redis cache invalidated for channelId={}", channelId);
            }
        } catch (Exception e) {
            log.error("Failed to process recommendation event: {}", e.getMessage());
        }
    }
}

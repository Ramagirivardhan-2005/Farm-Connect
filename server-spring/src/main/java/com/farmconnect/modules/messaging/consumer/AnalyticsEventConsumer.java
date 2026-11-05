package com.farmconnect.modules.messaging.consumer;

import com.farmconnect.modules.content.mongo.model.UserInteractionDocument;
import com.farmconnect.modules.content.mongo.repository.UserInteractionMongoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@ConditionalOnProperty(name = "farmconnect.rabbitmq.enabled", havingValue = "true")
public class AnalyticsEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsEventConsumer.class);

    private final ObjectProvider<UserInteractionMongoRepository> userInteractionMongoRepositoryProvider;

    public AnalyticsEventConsumer(ObjectProvider<UserInteractionMongoRepository> userInteractionMongoRepositoryProvider) {
        this.userInteractionMongoRepositoryProvider = userInteractionMongoRepositoryProvider;
    }

    @RabbitListener(queues = "farmconnect.analytics.queue")
    public void handleAnalyticsEvent(Map<String, Object> message) {
        log.info("RabbitMQ Analytics Worker received interaction event: {}", message.get("type"));
        UserInteractionMongoRepository repo = userInteractionMongoRepositoryProvider.getIfAvailable();
        if (repo == null) {
            log.debug("MongoDB UserInteractionMongoRepository not active. Skipping MongoDB interaction persistence.");
            return;
        }

        try {
            Long userId = message.get("userId") != null ? Long.valueOf(message.get("userId").toString()) : null;
            String type = (String) message.get("type");
            String targetId = message.get("targetId") != null ? message.get("targetId").toString() : null;
            String targetType = (String) message.get("targetType");

            UserInteractionDocument doc = new UserInteractionDocument(userId, type, targetId, targetType);
            repo.save(doc);
            log.info("Interaction event recorded asynchronously in MongoDB");
        } catch (Exception e) {
            log.error("Failed to store analytics event in MongoDB: {}", e.getMessage());
        }
    }
}

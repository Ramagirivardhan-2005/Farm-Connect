package com.farmconnect.modules.messaging.consumer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@ConditionalOnProperty(name = "farmconnect.rabbitmq.enabled", havingValue = "true")
public class NotificationEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventConsumer.class);

    private final SimpMessagingTemplate messagingTemplate;

    public NotificationEventConsumer(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @RabbitListener(queues = "farmconnect.notification.queue")
    public void handleNotificationEvent(Map<String, Object> message) {
        log.info("RabbitMQ Notification Worker received task: {}", message);
        try {
            Object userIdObj = message.get("userId");
            if (userIdObj != null) {
                String destination = "/topic/notifications/" + userIdObj;
                messagingTemplate.convertAndSend(destination, message);
                log.info("Real-time notification dispatched to STOMP destination: {}", destination);
            }
        } catch (Exception e) {
            log.error("Failed to process notification message: {}", e.getMessage(), e);
        }
    }
}

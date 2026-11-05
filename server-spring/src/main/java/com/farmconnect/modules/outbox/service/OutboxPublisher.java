package com.farmconnect.modules.outbox.service;

import com.farmconnect.modules.outbox.model.OutboxEvent;
import com.farmconnect.modules.outbox.model.OutboxStatus;
import com.farmconnect.modules.outbox.repository.OutboxEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class OutboxPublisher {

    private static final Logger log = LoggerFactory.getLogger(OutboxPublisher.class);

    @Value("${farmconnect.rabbitmq.enabled:false}")
    private boolean rabbitmqEnabled;

    private final OutboxEventRepository outboxEventRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectProvider<RabbitTemplate> rabbitTemplateProvider;

    public OutboxPublisher(OutboxEventRepository outboxEventRepository,
                           SimpMessagingTemplate messagingTemplate,
                           ObjectProvider<RabbitTemplate> rabbitTemplateProvider) {
        this.outboxEventRepository = outboxEventRepository;
        this.messagingTemplate = messagingTemplate;
        this.rabbitTemplateProvider = rabbitTemplateProvider;
    }

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void publishPendingEvents() {
        List<OutboxEvent> pending = outboxEventRepository.findByStatusOrderByCreatedAtAsc(
                OutboxStatus.PENDING, PageRequest.of(0, 50));

        if (pending.isEmpty()) {
            return;
        }

        log.info("Processing {} outbox events for asynchronous delivery...", pending.size());

        for (OutboxEvent event : pending) {
            try {
                // Broadcast to live WebSocket clients subscribed to topics
                String destination = "/topic/" + event.getAggregateType().toLowerCase() + "s";
                messagingTemplate.convertAndSend(destination, event.getPayload());

                // If aggregate is Order, also send to specific order channel
                if ("ORDER".equalsIgnoreCase(event.getAggregateType())) {
                    messagingTemplate.convertAndSend("/topic/orders/" + event.getAggregateId(), event.getPayload());
                }

                // If RabbitMQ enabled, publish to topic exchange
                if (rabbitmqEnabled && rabbitTemplateProvider.getIfAvailable() != null) {
                    String routingKey = "event." + event.getAggregateType().toLowerCase() + "." + event.getEventType().toLowerCase();
                    rabbitTemplateProvider.getIfAvailable().convertAndSend("farmconnect.exchange", routingKey, event.getPayload());
                }

                event.setStatus(OutboxStatus.PROCESSED);
                event.setProcessedAt(Instant.now());
                log.info("Outbox event published [id={}, type={}, aggregateId={}]",
                        event.getId(), event.getEventType(), event.getAggregateId());
            } catch (Exception e) {
                log.error("Failed to publish outbox event id={}: {}", event.getId(), e.getMessage());
                event.setRetryCount((event.getRetryCount() == null ? 0 : event.getRetryCount()) + 1);
                if (event.getRetryCount() >= 5) {
                    event.setStatus(OutboxStatus.FAILED);
                }
            }
            outboxEventRepository.save(event);
        }
    }
}

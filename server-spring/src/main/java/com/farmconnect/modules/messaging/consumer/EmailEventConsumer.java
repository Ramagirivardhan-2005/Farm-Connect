package com.farmconnect.modules.messaging.consumer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@ConditionalOnProperty(name = "farmconnect.rabbitmq.enabled", havingValue = "true")
public class EmailEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(EmailEventConsumer.class);

    private final JavaMailSender mailSender;

    public EmailEventConsumer(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @RabbitListener(queues = "farmconnect.email.queue")
    public void handleEmailEvent(Map<String, Object> message) {
        log.info("RabbitMQ Email Worker received task: {}", message);
        try {
            String to = (String) message.get("to");
            String subject = (String) message.get("subject");
            String body = (String) message.get("body");

            if (to != null && subject != null && body != null) {
                SimpleMailMessage mail = new SimpleMailMessage();
                mail.setTo(to);
                mail.setSubject(subject);
                mail.setText(body);
                mail.setFrom("FarmConnect Marketplace <otppurpose12@gmail.com>");
                mailSender.send(mail);
                log.info("Email successfully dispatched via SMTP to {}", to);
            }
        } catch (Exception e) {
            log.error("Failed to process email message: {}", e.getMessage(), e);
            throw new RuntimeException("Email delivery failed, routing to DLQ", e);
        }
    }
}

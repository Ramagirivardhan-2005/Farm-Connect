package com.farmconnect.common;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${farmconnect.mail.from:FarmConnect Marketplace <otppurpose12@gmail.com>}")
    private String mailFrom;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email dispatched successfully to {}", to);
        } catch (Exception e) {
            log.warn("Failed to dispatch email to {}: {}. Operation continuing gracefully.", to, e.getMessage());
        }
    }

    public void sendOtpEmail(String to, String otp) {
        String subject = "FarmConnect Delivery OTP: " + otp;
        String body = "Dear Customer,\n\nYour 6-digit delivery confirmation OTP is: " + otp +
                "\n\nPlease share this code with the delivery partner upon arrival to confirm receipt of your fresh harvest.\n\n" +
                "Valid for 10 minutes.\n\nWarm regards,\nFarmConnect Team";
        sendEmail(to, subject, body);
    }
}

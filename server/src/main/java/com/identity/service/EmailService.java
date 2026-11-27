package com.identity.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Async
    public void sendActivationEmail(String toEmail, String token) {
        logger.info("Sending activation email to: {}", toEmail);
        logger.info("Activation Token: {}", token);
        logger.info("Activation Link: http://localhost:5173/verify-email?token={}", token);
    }
}

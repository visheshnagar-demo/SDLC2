package com.citidirect.cashstatement.delivery;

import jakarta.mail.internet.MimeMessage;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
public class MailNotificationService {

    private final JavaMailSender mailSender;

    public MailNotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendReportEmail(String recipients,
                                String subject,
                                String messageBody,
                                String attachmentFilename,
                                byte[] attachmentBytes,
                                String contentType) throws Exception {
        if (recipients == null || recipients.trim().isEmpty()) {
            throw new IllegalArgumentException("No email recipients configured for delivery option");
        }

        String[] toList = Arrays.stream(recipients.split(";"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);

        if (toList.length == 0) {
            throw new IllegalArgumentException("Invalid recipient list format");
        }

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom("citidirect.automated.delivery@citi.com", "CitiDirect Automated Delivery");
        helper.setTo(toList);
        helper.setSubject(subject != null ? subject : "CitiDirect Statement Report");
        helper.setText(messageBody != null ? messageBody : "Please find your attached statement report.", false);

        if (attachmentBytes != null && attachmentBytes.length > 0) {
            String safeFilename = attachmentFilename != null ? attachmentFilename : "statement_report.pdf";
            helper.addAttachment(safeFilename, new ByteArrayResource(attachmentBytes), contentType != null ? contentType : "application/octet-stream");
        }

        // Propagate exceptions so delivery errors are properly reported in schedule history
        mailSender.send(message);
    }
}

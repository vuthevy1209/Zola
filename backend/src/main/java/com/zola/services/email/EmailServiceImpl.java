package com.zola.services.email;

import com.zola.dto.request.email.Account;
import com.zola.dto.request.email.EmailRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EmailServiceImpl implements EmailService {

    EmailClient emailClient;

    @NonFinal
    @Value("${spring.email.api-key}")
    String apiKey;

    @NonFinal
    @Value("${spring.email.sender.email}")
    String senderEmail;

    @NonFinal
    @Value("${spring.email.sender.name}")
    String senderName;

    @Override
    public void sendOtpEmail(String to, String otp) {
        String content = "<html>" +
                "<body>" +
                "<h2>Chào mừng bạn đến với Zola!</h2>" +
                "<p>Mã OTP để xác thực tài khoản của bạn là: <b style='font-size: 20px; color: #0084FF;'>" + otp
                + "</b></p>" +
                "<p>Mã này có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>" +
                "<br/>" +
                "<p>Trân trọng,</p>" +
                "<p>Đội ngũ Zola</p>" +
                "</body>" +
                "</html>";

        EmailRequest emailRequest = EmailRequest.builder()
                .sender(Account.builder().name(senderName).email(senderEmail).build())
                .to(java.util.List.of(Account.builder().email(to).build()))
                .subject("Zola - Mã xác thực OTP của bạn")
                .htmlContent(content)
                .build();

        try {
            emailClient.sendEmail(apiKey, emailRequest);
            log.info("OTP email sent successfully to {} via Brevo", to);
        } catch (Exception e) {
            log.error("Failed to send email to {} via Brevo", to, e);
            throw new RuntimeException("Could not send email via Brevo. Please check API key or configuration.");
        }
    }
}

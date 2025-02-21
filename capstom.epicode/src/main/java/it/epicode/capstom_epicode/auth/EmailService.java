package it.epicode.capstom_epicode.auth;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${server.base-url}")
    private String serverBaseUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String to, String token) throws MessagingException, MessagingException {
        String verificationUrl = serverBaseUrl + "/api/auth/verify-email?token=" + token;

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(to);
        helper.setSubject("🌟 Conferma la tua email - SapientPlus 🌟");
        helper.setFrom(fromEmail);
        helper.setText(buildHtmlEmail(verificationUrl), true); // True indica che il testo è HTML

        mailSender.send(message);
    }

    private String buildHtmlEmail(String verificationUrl) {
        return "<html>" +
                "<head>" +
                "   <style>" +
                "       .email-container { font-family: Arial, sans-serif; padding: 20px; text-align: center; background-color: #f4f4f4; }" +
                "       .email-box { background: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }" +
                "       .btn { background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }" +
                "       .btn:hover { background-color: #0056b3; }" +
                "   </style>" +
                "</head>" +
                "<body>" +
                "   <div class='email-container'>" +
                "       <div class='email-box'>" +
                "           <h2>Benvenuto in SapientPlus! 🎉</h2>" +
                "           <p>Grazie per esserti registrato! Conferma il tuo indirizzo email per attivare il tuo account.</p>" +
                "           <a href='" + verificationUrl + "' class='btn'>Conferma la tua email</a>" +
                "           <p>Se il pulsante non funziona, copia e incolla questo link nel browser:</p>" +
                "           <p><a href='" + verificationUrl + "'>" + verificationUrl + "</a></p>" +
                "           <p>Grazie!<br>Il team Sapient+</p>" +
                "       </div>" +
                "   </div>" +
                "</body>" +
                "</html>";
    }
}


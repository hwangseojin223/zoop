package com.zoop.backend.service;

import com.zoop.backend.domain.entity.EmailVerification;
import com.zoop.backend.repository.EmailVerificationRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final EmailVerificationRepository repository;
    private final Random random = new Random();

    public EmailService(JavaMailSender mailSender, EmailVerificationRepository repository) {
        this.mailSender = mailSender;
        this.repository = repository;
    }

    public void sendVerificationCode(String toEmail) throws MessagingException {
        String code = String.format("%06d", random.nextInt(999999));

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(toEmail);
        helper.setSubject("[줍(ZOOP)] 이메일 인증 코드입니다");
        helper.setText("인증 코드는 " + code + " 입니다. 5분 이내에 입력해주세요.");

        mailSender.send(message);

        EmailVerification verification = new EmailVerification();
        verification.setEmail(toEmail);
        verification.setCode(code);
        repository.save(verification);
    }

    public boolean verifyCode(String email, String code) {
        return repository.findTopByEmailOrderByCreatedAtDesc(email)
                .filter(v -> !v.isVerified())
                .filter(v -> v.getCode().equals(code))
                .map(v -> {
                    v.setVerified(true);
                    repository.save(v);
                    return true;
                }).orElse(false);
    }
}
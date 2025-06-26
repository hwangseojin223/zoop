package com.zoop.backend.service;

import java.util.Random;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.zoop.backend.domain.entity.EmailVerification;
import com.zoop.backend.domain.entity.Post;
import com.zoop.backend.repository.EmailVerificationRepository;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

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

    /**
     * 초대 이메일
     */
    public void sendInvitationEmail(String toEmail, String githubLogin, String token, Post post) throws MessagingException {
        
        String subject = "[ZOOP] " + post.getPostTitle() + " - 인터뷰 초대";
        String link = "http://localhost:3000/auth/applicant/signup/process/" + token;

        String body = String.format("""
        <div style="font-family:Arial, sans-serif; background-color:#f9f9f9; padding:20px;">
            <h2 style="color:#333;">👋 안녕하세요 %s 님,</h2>
            <p style="font-size:15px; color:#555;">ZOOP 플랫폼에서 아래 공고에 대한 인터뷰 초대를 보냈습니다.</p>

            <div style="background-color:#fff; border:1px solid #ddd; border-radius:8px; padding:16px; margin-top:20px;">
                <h3 style="color:#28a745;">📌 %s</h3>
                <table style="width:100%%; font-size:14px; color:#444; border-collapse:collapse;">
                    <tr>
                        <td style="padding:8px 0; font-weight:bold;">기술스택</td>
                        <td>%s</td>
                    </tr>
                    <tr>
                        <td style="padding:8px 0; font-weight:bold;">위치</td>
                        <td>%s</td>
                    </tr>
                    <tr>
                        <td style="padding:8px 0; font-weight:bold;">모집 인원</td>
                        <td>%s명</td>
                    </tr>
                    <tr>
                        <td style="padding:8px 0; font-weight:bold;">급여</td>
                        <td>%s ~ %s만원</td>
                    </tr>
                    <tr>
                        <td style="padding:8px 0; font-weight:bold;">공고 기간</td>
                        <td>%s ~ %s</td>
                    </tr>
                </table>
            </div>

            <div style="margin-top:30px; text-align:center;">
                <a href="%s" style="background-color:#28a745; color:#fff; text-decoration:none; padding:12px 24px; border-radius:6px; font-weight:bold; display:inline-block;">
                    👉 초대 확인하기
                </a>
            </div>

            <p style="margin-top:30px; font-size:13px; color:#777;">감사합니다.<br/>ZOOP 팀 드림</p>
        </div>
    """, githubLogin,
            post.getPostTitle(),
            post.getPostProgrammingLanguage(),
            post.getPostLocation(),
            post.getPostHeadcount(),
            post.getPostSalaryStart(),
            post.getPostSalaryEnd(),
            post.getPostPostedDate(),
            post.getPostExpiryDate(),
            link
        );


        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(body, true); // ✅ HTML 전송

        mailSender.send(message);
    }
}
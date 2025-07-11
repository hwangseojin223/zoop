package com.zoop.backend.service;

import java.util.Random;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

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

    @Value("${zoop.frontend.url:http://localhost:3000}")
    private String frontendUrl;

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
        String link = frontendUrl + "/invite/" + token;

        String body = String.format("""
        <div style=\"font-family:Arial, sans-serif; background-color:#f9f9f9; padding:20px;\">
            <h2 style=\"color:#333;\">👋 안녕하세요 %s 님,</h2>
            <p style=\"font-size:15px; color:#555;\">ZOOP 플랫폼에서 아래 공고에 대한 인터뷰 초대를 보냈습니다.</p>

            <div style=\"background-color:#fff; border:1px solid #ddd; border-radius:8px; padding:16px; margin-top:20px;\">
                <h3 style=\"color:#28a745;\">📌 %s</h3>
                <table style=\"width:100%%; font-size:14px; color:#444; border-collapse:collapse;\">
                    <tr>
                        <td style=\"padding:8px 0; font-weight:bold;\">기술스택</td>
                        <td>%s</td>
                    </tr>
                    <tr>
                        <td style=\"padding:8px 0; font-weight:bold;\">위치</td>
                        <td>%s</td>
                    </tr>
                    <tr>
                        <td style=\"padding:8px 0; font-weight:bold;\">모집 인원</td>
                        <td>%s명</td>
                    </tr>
                    <tr>
                        <td style=\"padding:8px 0; font-weight:bold;\">급여</td>
                        <td>%s ~ %s만원</td>
                    </tr>
                    <tr>
                        <td style=\"padding:8px 0; font-weight:bold;\">공고 기간</td>
                        <td>%s ~ %s</td>
                    </tr>
                </table>
            </div>

            <div style=\"margin-top:30px; text-align:center;\">
                <a href=\"%s\" style=\"background-color:#28a745; color:#fff; text-decoration:none; padding:12px 24px; border-radius:6px; font-weight:bold; display:inline-block;\">
                    👉 초대 확인하기
                </a>
            </div>

            <p style=\"margin-top:30px; font-size:13px; color:#777;\">감사합니다.<br/>ZOOP 팀 드림</p>
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

    /**
     * 지원 확인 이메일
     */
    public void sendApplicationConfirmationEmail(String toEmail, String candidateName, String postTitle) throws MessagingException {
        String subject = "[ZOOP] " + postTitle + " - 지원 확인";
        
        String body = String.format("""
        <div style=\"font-family:Arial, sans-serif; background-color:#f9f9f9; padding:20px;\">
            <h2 style=\"color:#333;\">👋 안녕하세요 %s 님,</h2>
            <p style=\"font-size:15px; color:#555;\">ZOOP 플랫폼에 지원해주셔서 감사합니다.</p>

            <div style=\"background-color:#fff; border:1px solid #ddd; border-radius:8px; padding:16px; margin-top:20px;\">
                <h3 style=\"color:#28a745;\">📌 %s</h3>
                <p style=\"font-size:14px; color:#444;\">지원이 성공적으로 접수되었습니다.</p>
                <p style=\"font-size:14px; color:#444;\">검토 후 결과를 이메일로 안내드리겠습니다.</p>
            </div>

            <div style=\"margin-top:30px; padding:16px; background-color:#e8f5e8; border-radius:8px;\">
                <h4 style=\"color:#28a745; margin-top:0;\">📋 지원 절차</h4>
                <ol style=\"color:#555; font-size:14px;\">
                    <li>지원서 검토 (1-2일 소요)</li>
                    <li>1차 AI 면접 (선택사항)</li>
                    <li>기업 면접</li>
                    <li>최종 결과 안내</li>
                </ol>
            </div>

            <p style=\"margin-top:30px; font-size:13px; color:#777;\">감사합니다.<br/>ZOOP 팀 드림</p>
        </div>
        """, candidateName, postTitle);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(body, true); // HTML 전송

        mailSender.send(message);
    }

    /** 비밀번호 재설정 이메일 (추가 후) */
    public void sendPasswordResetEmail(String toEmail, String githubLogin, String resetLink) throws MessagingException {
        String subject = "[ZOOP] 비밀번호 재설정 안내";

        String body = String.format("""
        <div style=\"font-family:Arial, sans-serif; background-color:#f9f9f9; padding:20px;\">
            <h2 style=\"color:#333;\">안녕하세요 %s 님,</h2>
            <p style=\"font-size:15px; color:#555;\">ZOOP에서 비밀번호 재설정을 요청하셨습니다.</p>
            <p style=\"font-size:14px; color:#777;\">아래 버튼을 클릭하여 비밀번호를 재설정해주세요. <strong>해당 링크는 1시간 동안만 유효합니다.</strong></p>

            <div style=\"margin-top:30px; text-align:center;\">
                <a href=\"%s\" style=\"background-color:#28a745; color:#fff; text-decoration:none; padding:12px 24px; border-radius:6px; font-weight:bold; display:inline-block;\">
                    🔒 비밀번호 재설정하기
                </a>
            </div>

            <p style=\"margin-top:30px; font-size:13px; color:#999;\">본인이 요청하지 않은 경우 이 메일은 무시하셔도 됩니다.</p>
            <p style=\"font-size:13px; color:#777;\">감사합니다.<br/>ZOOP 팀 드림</p>
        </div>
        """, githubLogin, resetLink);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(toEmail);      // 수신자 설정
        helper.setSubject(subject);
        helper.setText(body, true); // HTML 전송

        mailSender.send(message);
    }
}
package com.zoop.backend.controller;

import com.zoop.backend.service.EmailService;
import jakarta.mail.MessagingException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
public class EmailController {

    private final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/send")
    public ResponseEntity<String> sendCode(@RequestParam String email) {
        try {
            emailService.sendVerificationCode(email);
            return ResponseEntity.ok("인증 코드가 전송되었습니다.");
        } catch (MessagingException e) {
            return ResponseEntity.status(500).body("이메일 전송 실패: " + e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyCode(@RequestParam String email, @RequestParam String code) {
        boolean result = emailService.verifyCode(email, code);
        if (result) {
            return ResponseEntity.ok("이메일 인증 성공");
        } else {
            return ResponseEntity.status(400).body("인증 실패. 코드가 틀리거나 이미 인증되었습니다.");
        }
    }
}

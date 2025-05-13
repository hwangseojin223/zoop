package com.zoop.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.zoop.backend.service.EmailService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.mail.MessagingException;

@Tag(name="EmailController", description="이메일 인증 관련 API")
@RestController
@RequestMapping("/api/email")
public class EmailController {

    private final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }
    @Operation(summary="인증 코드 전송", description="지정된 이메일 주소로 인증 코드를 전송합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode="200", description="인증 코드가 성공적으로 전송됨",
            content=@Content(schema=@Schema(implementation=String.class))),
        @ApiResponse(responseCode="500", description="이메일 전송 실패(서버 오류)",
            content = @Content(schema=@Schema(implementation=String.class)))
    })
    @PostMapping("/send")
    public ResponseEntity<String> sendCode(
            @Parameter(description="인증 코드를 받을 이메일 주소", required=true, example="test@example.com")     
            @RequestParam String email) {
        try {
            emailService.sendVerificationCode(email);
            return ResponseEntity.ok("인증 코드가 전송되었습니다.");
        } catch (MessagingException e) {
            return ResponseEntity.status(500).body("이메일 전송 실패: " + e.getMessage());
        }
    }

    @Operation(summary="인증 코드 확인", description="입력받은 이메일 주소와 코드를 검증합니다.")
    @ApiResponses(value={
        @ApiResponse(responseCode="200", description="이메일 인증 성공",
            content=@Content(schema=@Schema(implementation=String.class))),
        @ApiResponse(responseCode="400", description="인증 실패(코드가 틀리거나 이미 인증됨)",
            content=@Content(schema=@Schema(implementation=String.class)))
    })
    @PostMapping("/verify")
    public ResponseEntity<String> verifyCode(
            @Parameter(description="인증 코드를 확인할 이메일 주소", required=true, example="test@example.com")
            @RequestParam String email,
            @Parameter(description="수신한 인증 코드", required=true, example="12345")
            @RequestParam String code) {
            boolean result = emailService.verifyCode(email, code);
        if (result) {
            return ResponseEntity.ok("이메일 인증 성공");
        } else {
            return ResponseEntity.status(400).body("인증 실패. 코드가 틀리거나 이미 인증되었습니다.");
        }
    }
}

package com.zoop.backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.zoop.backend.domain.dto.finding.PasswordResetRequest;
import com.zoop.backend.domain.dto.finding.ResetPasswordRequest;
import com.zoop.backend.service.CandidateService;
import com.zoop.backend.service.PasswordResetService;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/candidate")
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/request-password-reset")
    public ResponseEntity<String> requestPasswordReset(@RequestBody PasswordResetRequest request) {
        passwordResetService.requestPasswordReset(request);
        log.info("✅ 요청 정보: " + request.getGithubLogin() + ", " +
                            request.getEmail() + ", " +
                            request.getCandidateName() + ", " +
                            request.getCandidatePhoneNumber());

        return ResponseEntity.ok("비밀번호 재설정 이메일을 전송했습니다.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


}
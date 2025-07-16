package com.zoop.backend.domain.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CandidateInfo {
    
    @NotBlank(message = "GitHub 로그인은 필수입니다")
    private String githubLogin;     // GitHub 사용자명
    
    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "올바른 이메일 형식이 아닙니다")
    private String candidateEmail;  // 후보자 이메일
} 
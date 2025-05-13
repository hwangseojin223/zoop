/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.zoop.backend.domain.dto;
/**
 *
 * @author hwangseojin
 */

import jakarta.validation.constraints.Email; // Lombok 라이브러리 임포트
import jakarta.validation.constraints.NotBlank; // Validation 어노테이션 임포트 (spring-boot-starter-validation 필요)
import jakarta.validation.constraints.Size;   // Validation 어노테이션 임포트
import lombok.AllArgsConstructor;     // Validation 어노테이션 임포트
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor // Lombok 어노테이션
public class CandidateSignupRequest {
    @NotBlank(message = "깃허브 로그인은 필수입니다.") // 필드가 null이 아니고, 공백 문자열이 아닌지 검사
    private String githubLogin;

    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "유효한 이메일 형식이 아닙니다.") // 유효한 이메일 형식인지 검사
    private String candidateEmail;

    @NotBlank(message = "비밀번호는 필수입니다.")
    @Size(min = 8, message = "비밀번호는 최소 8자 이상이어야 합니다.") // 문자열 길이 검사
    private String candidatePassword;

    private String candidateName; // @NotBlank 등 제약 조건이 없으므로 필수는 아님
    private String candidatePhoneNumber; // @NotBlank 등 제약 조건이 없으므로 필수는 아님
}

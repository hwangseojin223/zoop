/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.zoop.backend.domain.dto;

/**
 *
 * @author hwangseojin
 */

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull; // null이 아닌지 검사 (Long 타입에 사용)
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor // Lombok 어노테이션
public class CompanyAdminSignupRequest {
    @NotNull(message = "회사 ID는 필수입니다.") // 관리자가 속할 회사의 ID (Long 타입이므로 NotBlank 대신 NotNull 사용)
    private Long companyId;

    @NotBlank(message = "관리자 로그인 아이디는 필수입니다.")
    private String companyAdminLogin;

    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "유효한 이메일 형식이 아닙니다.")
    private String companyAdminEmail;

    @NotBlank(message = "비밀번호는 필수입니다.")
    @Size(min = 8, message = "비밀번호는 최소 8자 이상이어야 합니다.")
    private String companyAdminPassword;

    @NotBlank(message = "관리자 이름은 필수입니다.")
    private String companyAdminName;
}



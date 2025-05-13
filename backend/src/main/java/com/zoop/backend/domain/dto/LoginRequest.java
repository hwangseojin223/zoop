/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.zoop.backend.domain.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    @NotBlank(message = "아이디는 필수입니다.")
    private String loginId; // 필드 이름이 loginId인지 확인

    @NotBlank(message = "비밀번호는 필수입니다.")
    private String password;

    @NotBlank(message = "사용자 유형은 필수입니다.")
    private String userType;
}


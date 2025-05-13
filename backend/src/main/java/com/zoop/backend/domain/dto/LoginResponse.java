/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.zoop.backend.domain.dto;

/**
 *
 * @author hwangseojin
 */

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor // Lombok 어노테이션
public class LoginResponse {
    private String token; // 로그인 성공 시 백엔드에서 발급할 JWT 토큰 (String 형태)
    private String userType; // 로그인한 사용자의 유형 ("candidate" 또는 "company")
    private Long userId; // 로그인한 사용자의 고유 ID (candidateId 또는 companyAdminId)
    private String message; // 로그인 성공/실패에 대한 간단한 메시지
}


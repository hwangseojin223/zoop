/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.zoop.backend.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

/**
 *
 * @author KOSA
 */
@OpenAPIDefinition(
    info = @Info(
        title = "사용자 관리 API",
        description = "사용자 정보를 관리하는 API 문서입니다.",
        version = "v1"
    ),
    servers = { // 서버 정보 추가 (선택 사항)
        @Server(url = "http://localhost:8080", description = "Local Development Server")
       
    }
)
@Configuration // Spring 설정 클래스로 등록
public class OpenApiConfig {
    // CORS 설정 제거 - CorsConfig에서 통합 관리
}

/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.zoop.backend.config;

/**
 *
 * @author hwangseojin
 */

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

/**
 * OpenAPI 설정을 위한 Configuration 클래스입니다.
 * API 문서의 기본 정보(제목, 설명, 버전 등)를 정의합니다.
 */
@Configuration // 이 클래스가 Spring 설정 클래스임을 나타냅니다.
public class OpenApiConfig {

    // OpenAPI 빈 정의: API 문서의 기본 정보를 설정합니다.
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("ZOOP Backend API") // 원하는 API 문서 제목 설정
                        .version("1.0") // 원하는 API 버전 설정
                        .description("ZOOP 채용 플랫폼 백엔드 API 문서입니다.") // 원하는 API 설명 설정
                );
    }

    // TODO: 필요에 따라 특정 컨트롤러/패키지만 문서에 포함시키거나 그룹화하는 설정 등을 추가할 수 있습니다.
    // 예: GroupedOpenApi 빈 설정
    /*
    import org.springdoc.core.models.GroupedOpenApi;

    @Bean
    public GroupedOpenApi authApi() {
        return GroupedOpenApi.builder()
                .group("인증/인가 API") // 그룹 이름 설정
                .pathsToMatch("/api/auth/**") // "/api/auth/" 경로로 시작하는 API만 포함
                .build();
    }
    */
}

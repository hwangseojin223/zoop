package com.zoop.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AppConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // @Bean
    // public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    //     http
    //         .csrf().disable()
    //         .authorizeHttpRequests(auth -> auth
    //             .anyRequest().permitAll()
    //         );
    //     return http.build();
    // }
    // @Bean
    // public CorsConfigurationSource corsConfigurationSource() {
    //     CorsConfiguration configuration = new CorsConfiguration();
    //     // setAllowedOrigins(): 허용할 Origin 목록을 지정합니다. (프로토콜://도메인:포트 형식)
    //     // React 개발 서버의 주소(예: http://localhost:3000)를 정확히 명시합니다.
    //     configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000")); // <-- React 개발 서버 포트로 정확히 설정

    //     // setAllowedMethods(): 허용할 HTTP 메소드 목록을 지정합니다. (POST 요청 등) OPTIONS는 CORS Preflight 요청에 필요합니다.
    //     configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

    //     // setAllowedHeaders(): 클라이언트가 요청에 포함할 수 있도록 허용할 헤더 목록을 지정합니다.
    //     // 'Authorization' 헤더는 JWT 토큰을 전달할 때 필요하며, 'Content-Type' 등도 포함합니다.
    //     configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"));

    //     // setAllowCredentials(true): 자격 증명(쿠키, Authorization 헤더 등)을 요청에 포함시킬지 여부를 설정합니다.
    //     // Authorization 헤더를 사용하므로 true로 설정해야 합니다.
    //     configuration.setAllowCredentials(true);

    //     // UrlBasedCorsConfigurationSource: URL 패턴 기반으로 CORS 설정을 적용할 수 있게 해주는 구현체입니다.
    //     UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    //     // registerCorsConfiguration(): 특정 URL 패턴에 대해 위에서 정의한 CORS 설정을 적용합니다.
    //     // "/**"는 애플리케이션의 모든 경로에 대해 CORS 설정을 적용하겠다는 의미입니다.
    //     source.registerCorsConfiguration("/**", configuration);

    //     return source; // 설정된 CorsConfigurationSource 객체를 빈으로 등록하여 반환합니다.
    // }


//     @Bean
// public CorsConfigurationSource corsConfigurationSource() {
//     CorsConfiguration configuration = new CorsConfiguration();
//     configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000")); // <-- http://localhost:3000 이 정확한지 확인
//     configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
//     configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin")); // 필요하다면 추가
//     configuration.setAllowCredentials(true);
//     configuration.setMaxAge(3600L); // Preflight Request의 결과를 캐싱할 시간(초)
//     UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//     source.registerCorsConfiguration("/**", configuration); // <-- /api/** 또는 /** 로 설정
//     return source;
// }

}

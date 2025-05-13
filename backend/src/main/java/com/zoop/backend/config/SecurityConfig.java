package com.zoop.backend.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // TODO: JWT 인증 필터 구현 시 주입받도록 수정
    // private final JwtAuthenticationFilter jwtAuthenticationFilter;
    // @Autowired // 생성자를 통한 의존성 주입 (JWT 필터 구현 후 활성화)
    // public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
    //     this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    // }

    // PasswordEncoder 빈 정의는 AppConfig에 있습니다. 여기서는 필요 없습니다.
    // @Bean
    // public PasswordEncoder passwordEncoder() { ... }

    // SecurityFilterChain 빈 정의 활성화
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // CSRF 보호 비활성화

            // CORS 설정 활성화 (아래 corsConfigurationSource 빈 정의와 연결)
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) // CorsConfigurationSource 빈 사용 명시

            // 세션 관리 설정: Stateless (세션 사용 안 함) - JWT 기반 인증에 필수
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // 요청 권한 설정
            .authorizeHttpRequests(auth -> auth
                // "/api/auth/"로 시작하는 경로는 인증 없이 접근 허용
                .requestMatchers("/api/auth/**").permitAll()
                // TODO: 기타 공개되어야 할 API 경로들 permitAll()로 추가

                // 그 외 모든 요청은 인증 필요 (JWT 검증 필터를 통과해야 함)
                .anyRequest().authenticated()
            );

            // TODO: JWT 인증 필터 등록 (JWT 구현 후 이 줄의 주석을 해제)
            // .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

            // 기본 로그인/로그아웃 설정 비활성화 (JWT 방식에서는 보통 직접 구현)
            // .formLogin(AbstractHttpConfigurer::disable) // Spring Security 6.x+ 비활성화 방법 (필요 시 주석 해제)
            // .logout(logout -> logout.disable()); // Logout 설정 완료 (이전에 끊어진 부분)

        return http.build(); // SecurityFilterChain 빈 생성
    }

    // CORS 설정 Bean 정의 활성화
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000")); // 프런트엔드 Origin
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS")); // 허용 메서드
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin")); // 허용 헤더
        configuration.setAllowCredentials(true); // 자격 증명 허용
        configuration.setMaxAge(3600L); // 캐싱 시간
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // 모든 경로에 CORS 설정 적용
        return source;
    }
}

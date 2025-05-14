package com.zoop.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zoop.backend.domain.dto.LoginRequest;
import com.zoop.backend.domain.entity.Candidate;
import com.zoop.backend.domain.entity.CompanyAdmin; // Candidate 엔티티 임포트
import com.zoop.backend.repository.CandidateRepository;
import com.zoop.backend.repository.CompanyAdminRepository; // CandidateRepository 임포트
import com.zoop.backend.util.JwtUtil;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name="AuthController", description="사용자 인증 관련 API(로그인)")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final CompanyAdminRepository adminRepo;
    private final CandidateRepository candidateRepo; // CandidateRepository 주입
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // 생성자 주입
    public AuthController(CompanyAdminRepository adminRepo, CandidateRepository candidateRepo, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.adminRepo = adminRepo;
        this.candidateRepo = candidateRepo; // CandidateRepository 초기화
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Operation(summary="사용자 로그인", description="아이디와 비밀번호, 사용자 유형을 사용하여 로그인하고 JWT 토큰을 발급받습니다.")
    @ApiResponses(value= {
        @ApiResponse(responseCode="200", description="로그인 성공 및 JWT 토큰 발급",
            content=@Content(schema=@Schema(implementation=LoginResponse.class))),
        @ApiResponse(responseCode ="404", description="존재하지 않는 아이디"),
        @ApiResponse(responseCode="401", description="비밀번호 불일치"),
        @ApiResponse(responseCode="400", description="잘못된 사용자 유형") // 잘못된 userType에 대한 응답 추가
    })

    @PostMapping("/login")
    public ResponseEntity<?> login(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "로그인을 위한 아이디, 비밀번호, 사용자 유형 (candidate 또는 company)",
            required=true,
            content=@Content(schema=@Schema(implementation=LoginRequest.class))
        )
        @org.springframework.web.bind.annotation.RequestBody LoginRequest request) {

        String userType = request.getUserType();
        String loginId = request.getLoginId();
        String password = request.getPassword();

        // 1. userType에 따라 사용자 조회
        if ("company".equals(userType)) {
            // 기업회원 로그인 처리
            CompanyAdmin admin = adminRepo.findByLoginId(loginId).orElse(null);

            if (admin == null) {
                // 로그 추가 (디버깅용)
                System.out.println("🔐 기업회원 - 아이디 찾기 실패: " + loginId);
                return ResponseEntity.status(404).body("존재하지 않는 아이디입니다.");
            }

            // 2. 비밀번호 검증
            System.out.println("🔐 기업회원 - raw password = " + password);
            System.out.println("🔐 기업회원 - hashed password = " + admin.getPassword());
            boolean match = passwordEncoder.matches(password, admin.getPassword());
            System.out.println("🔐 기업회원 - password match result = " + match);


            if (!match) {
                return ResponseEntity.status(401).body("비밀번호가 일치하지 않습니다.");
            }

            // 3. JWT 발급 및 응답 반환
            // 토큰 페이로드에 loginId 사용 (기존 로직 유지)
            String jwtToken = jwtUtil.generateToken(admin.getLoginId());

            return ResponseEntity.ok(Map.of(
                    "token", jwtToken,
                    "userId", admin.getCompanyAdminId(),
                    "userType", "company",
                    "loginId", admin.getLoginId()
            ));

        } else if ("candidate".equals(userType)) {
            // 개인회원 로그인 처리
            // h님께서 github_login만 사용하겠다고 하셨으므로 githubLogin으로 조회
            Candidate candidate = candidateRepo.findByGithubLogin(loginId).orElse(null);

            // 만약 이메일로도 찾고 싶다면 아래 주석 해제 후 로직 추가
            // if (candidate == null && loginId.contains("@")) {
            //    candidate = candidateRepo.findByCandidateEmail(loginId).orElse(null);
            // }


            if (candidate == null) {
                // 로그 추가 (디버깅용)
                System.out.println("🔐 개인회원 - 아이디(githubLogin) 찾기 실패: " + loginId);
                return ResponseEntity.status(404).body("존재하지 않는 아이디입니다.");
            }

            // 2. 비밀번호 검증
            System.out.println("🔐 개인회원 - raw password = " + password);
            System.out.println("🔐 개인회원 - hashed password = " + candidate.getCandidatePassword());
            boolean match = passwordEncoder.matches(password, candidate.getCandidatePassword());
             System.out.println("🔐 개인회원 - password match result = " + match);


            if (!match) {
                return ResponseEntity.status(401).body("비밀번호가 일치하지 않습니다.");
            }

            // 3. JWT 발급 및 응답 반환
            // 토큰 페이로드에 githubLogin 사용 (기존 기업회원 로직과 유사하게 loginId 사용)
            String jwtToken = jwtUtil.generateToken(candidate.getGithubLogin());

            return ResponseEntity.ok(Map.of(
                    "token", jwtToken,
                    "userId", candidate.getCandidateId(), // 개인회원 ID 사용
                    "userType", "candidate",
                    "loginId", candidate.getGithubLogin() // 개인회원의 경우 githubLogin 반환
            ));

        } else {
            // 잘못된 userType이 요청으로 온 경우
            System.out.println("🔐 유효하지 않은 userType 요청: " + userType);
            return ResponseEntity.status(400).body("유효하지 않은 사용자 유형입니다.");
        }
    }

    // Swagger 문서화를 위한 더미 클래스 (실제 응답 구조와 일치하도록 조정 필요)
    private static class LoginResponse {
        public String token;
        public Long userId; // 또는 적절한 타입
        public String userType;
        public String loginId;
    }
}
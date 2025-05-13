package com.zoop.backend.controller;

import com.zoop.backend.domain.entity.CompanyAdmin;
import com.zoop.backend.domain.dto.LoginRequest;
import com.zoop.backend.repository.CompanyAdminRepository;
import com.zoop.backend.util.JwtUtil;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name="AuthController", description="사용자 인증 관련 API(로그인)")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final CompanyAdminRepository adminRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(CompanyAdminRepository adminRepo, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.adminRepo = adminRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }
    @Operation(summary="사용자 로그인", description="아이디와 비밀번호를 사용하여 로그인하고 JWT 토큰을 발급받습니다.")
    @ApiResponse(value= {
        @ApiResponse(responseCode="200", description="로그인 성공 및 JWT 토큰 발급",
            content=@Content(schema=@Schema(implementation=LoginResponse.class)), 
        @ApiResponse(responseCode ="404", description="존재하지 않는 아이디"),
        @ApiResponse(responseCode="401", description="비밀번호 불일치")
        )
    })
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        CompanyAdmin admin = adminRepo.findByLoginId(request.getLoginId()).orElse(null);

        if (admin == null) {
            return ResponseEntity.status(404).body("존재하지 않는 아이디입니다.");
        }

        System.out.println("🔐 raw = " + request.getPassword());
        System.out.println("🔐 hashed = " + admin.getPassword());
        boolean match = passwordEncoder.matches(request.getPassword(), admin.getPassword());
        System.out.println("🔐 match result = " + match);

        if (!match) {
            return ResponseEntity.status(401).body("비밀번호가 일치하지 않습니다.");
        }

        // ✅ 실제 JWT 발급
        String jwtToken = jwtUtil.generateToken(admin.getLoginId());

        return ResponseEntity.ok(Map.of(
                "token", jwtToken,
                "userId", admin.getCompanyAdminId(),
                "userType", "company",
                "loginId", admin.getLoginId() 
        ));
    }

    private static class LoginResponse {

        public LoginResponse() {
        }
    }
}

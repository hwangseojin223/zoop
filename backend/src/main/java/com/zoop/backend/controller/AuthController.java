/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.zoop.backend.controller;

/**
 *
 * @author hwangseojin
 */

import com.zoop.backend.domain.dto.CandidateSignupRequest; // domain.dto 패키지 임포트
import com.zoop.backend.domain.dto.CompanyAdminSignupRequest; // domain.dto 패키지 임포트
import com.zoop.backend.domain.dto.LoginRequest; // domain.dto 패키지 임포트
import com.zoop.backend.domain.dto.LoginResponse; // domain.dto 패키지 임포트
import com.zoop.backend.service.AuthService; // service 패키지 임포트
import org.springframework.beans.factory.annotation.Autowired; // 의존성 주입 어노테이션 (@Autowired)
import org.springframework.http.HttpStatus; // HTTP 상태 코드 사용 (예: OK, CREATED, BAD_REQUEST, UNAUTHORIZED)
import org.springframework.http.ResponseEntity; // HTTP 응답 객체 사용 (상태 코드, 헤더, 본문 포함)
import org.springframework.validation.annotation.Validated; // @Validated 어노테이션 임포트 (Controller에서 메소드 파라미터 유효성 검사 활성화)
import org.springframework.web.bind.annotation.*; // 웹 관련 주요 어노테이션 임포트 (RestController, RequestMapping, PostMapping 등)
import jakarta.validation.Valid; // DTO 유효성 검사를 위한 어노테이션 (@Valid)

/**
 * 인증(Authentication) 및 회원 가입(Registration) 관련 HTTP 요청을 처리하는 REST 컨트롤러입니다.
 * 클라이언트로부터 요청을 받아 요청 데이터를 유효성 검사(@Valid, @Validated)하고,
 * 비즈니스 로직을 처리하는 서비스 계층(AuthService)으로 요청을 위임합니다.
 * 서비스 계층의 결과를 받아 HTTP 응답(ResponseEntity)으로 변환하여 클라이언트에 반환합니다.
 */
@RestController // 이 클래스가 RESTful 웹 서비스의 컨트롤러임을 Spring에게 알립니다. Spring 빈으로 등록됩니다. (@Controller + @ResponseBody 포함)
@RequestMapping("/api/auth") // 이 컨트롤러 내의 모든 핸들러 메소드에 대한 기본 경로를 설정합니다. (예: http://localhost:8080/api/auth)
@Validated // 이 컨트롤러 클래스 내에서 @Valid 어노테이션을 사용하여 메소드 파라미터의 유효성 검사를 수행하도록 활성화합니다.
public class AuthController {

    private final AuthService authService; // AuthService 빈을 주입받을 필드입니다.

    // 생성자 주입 (@Autowired 어노테이션을 사용하여 Spring 컨테이너로부터 AuthService 빈을 주입받습니다.)
    // Spring이 이 컨트롤러를 생성할 때 필요한 AuthService 객체를 찾아서 인자로 전달해줍니다.
    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // 개인 후보자 회원가입 엔드포인트 (HTTP POST 요청: /api/auth/signup/candidate)
    // 클라이언트가 개인 회원 가입을 위해 이 엔드포인트로 HTTP POST 요청을 보냅니다.
    @PostMapping("/signup/candidate") // HTTP POST 요청을 이 경로("/signup/candidate")에 매핑합니다. 기본 경로는 /api/auth입니다.
    // @Valid: 요청 본문으로 받은 CandidateSignupRequest 객체의 필드에 정의된 유효성 제약 조건(@NotBlank, @Email 등)을 검사하도록 지시합니다.
    // @RequestBody: HTTP 요청의 본문(Body)을 자바 객체(CandidateSignupRequest)로 자동 변환합니다. 주로 JSON 또는 XML 데이터를 처리합니다.
    public ResponseEntity<?> signupCandidate(@Valid @RequestBody CandidateSignupRequest request) {
        try {
            // 서비스 계층의 개인 후보자 회원 가입 로직을 호출합니다.
            authService.signupCandidate(request);
            // 회원 가입 성공 시, HTTP 상태 코드 201 (Created)과 함께 성공 메시지를 응답 본문(Body)에 담아 반환합니다.
            return ResponseEntity.status(HttpStatus.CREATED).body("개인 회원가입 성공");
        } catch (RuntimeException e) {
            // 서비스 계층에서 발생한 RuntimeException(예: 이미 존재하는 사용자)을 잡아서 클라이언트에 오류 응답을 보냅니다.
            // HTTP 상태 코드 400 (Bad Request - 클라이언트 요청 데이터 문제)과 함께 예외 메시지를 응답 본문에 담아 반환합니다.
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
        // @Valid 유효성 검사 실패 시에는 MethodArgumentNotValidException이 발생하며, Spring Boot의 기본 핸들러에 의해 400 Bad Request 응답이 자동으로 반환됩니다.
    }

    // 기업 관리자 회원가입 엔드포인트 (HTTP POST 요청: /api/auth/signup/company)
    // 클라이언트가 기업 관리자 회원 가입을 위해 이 엔드포인트로 HTTP POST 요청을 보냅니다.
     @PostMapping("/signup/company")
     // @Valid @RequestBody는 파라미터 앞에 붙여야 합니다. 이전 오류 해결을 위해 메소드 선언 바로 위에 있던 줄을 삭제했습니다.
    public ResponseEntity<?> signupCompanyAdmin(@Valid @RequestBody CompanyAdminSignupRequest request) { // @Valid, @RequestBody 어노테이션을 요청 DTO 파라미터 앞에 붙입니다.
         try {
             // 서비스 계층의 기업 관리자 회원 가입 로직을 호출합니다.
             authService.signupCompanyAdmin(request);
             // 회원 가입 성공 시, HTTP 상태 코드 201 (Created)과 함께 성공 메시지를 응답 본문에 담아 반환합니다.
             return ResponseEntity.status(HttpStatus.CREATED).body("기업 관리자 회원가입 성공");
         } catch (RuntimeException e) {
             // 서비스 계층에서 발생한 RuntimeException(예: 이미 존재하는 관리자, 유효하지 않은 회사 ID 등)을 잡아서 클라이언트에 오류 응답을 보냅니다.
             // HTTP 상태 코드 400 (Bad Request)과 함께 예외 메시지를 응답 본문에 담아 반환합니다.
             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
         }
    }

    // 로그인 엔드포인트 (HTTP POST 요청: /api/auth/login)
    // 클라이언트가 로그인을 위해 이 엔드포인트로 HTTP POST 요청을 보냅니다.
    @PostMapping("/login")
    // @Valid @RequestBody는 파라미터 앞에 붙여야 합니다. 이전 오류 해결을 위해 메소드 선언 바로 위에 있던 줄을 삭제했습니다.
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) { // @Valid, @RequestBody 어노테이션을 로그인 요청 DTO 파라미터 앞에 붙입니다.
        try {
            // 서비스 계층의 로그인 로직을 호출하고, 로그인 성공 시 LoginResponse DTO 객체를 반환받습니다.
            LoginResponse response = authService.login(request);
            // 로그인 성공 시, HTTP 상태 코드 200 (OK)과 함께 서비스에서 반환받은 LoginResponse DTO 객체를 응답 본문에 담아 반환합니다.
            return ResponseEntity.ok().body(response);
        } catch (IllegalArgumentException e) { // AuthService에서 유효하지 않은 사용자 유형 등 클라이언트 요청 데이터 오류 시 발생시키는 예외를 잡습니다.
             // 유효하지 않은 요청 데이터(예: userType 필드 값이 'candidate' 또는 'company'가 아님)에 대한 응답
             // HTTP 상태 코드 400 (Bad Request)과 함께 예외 메시지를 응답 본문에 담아 반환합니다.
             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (RuntimeException e) { // AuthService에서 사용자 조회 실패(존재하지 않는 아이디) 또는 비밀번호 불일치 시 발생시키는 예외를 잡습니다.
            // 인증 실패(로그인 정보 불일치)에 대한 응답
            // HTTP 상태 코드 401 (Unauthorized)과 함께 예외 메시지를 응답 본문에 담아 반환합니다.
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
        // 참고: catch 블록 순서는 더 구체적인 예외(IllegalArgumentException)를 먼저 잡고,
        // 더 일반적인 예외(RuntimeException)를 나중에 잡도록 해야 합니다. (RuntimeException은 IllegalArgumentException의 부모 클래스)
        // 이는 Java의 예외 처리 규칙에 따릅니다.
    }
}


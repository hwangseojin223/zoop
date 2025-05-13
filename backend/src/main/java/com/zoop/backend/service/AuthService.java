/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.zoop.backend.service;

/**
 *
 * @author hwangseojin
 */  

import java.sql.Timestamp; // domain.entity 패키지 임포트
import java.time.LocalDateTime; // domain.entity 패키지 임포트
import java.util.Date; // domain.entity 패키지 임포트 (CompanyAdmin 엔티티에서 참조)

import org.springframework.beans.factory.annotation.Autowired; // domain.dto 패키지 임포트
import org.springframework.security.crypto.password.PasswordEncoder; // domain.dto 패키지 임포트
import org.springframework.stereotype.Service; // domain.dto 패키지 임포트
import org.springframework.transaction.annotation.Transactional; // domain.dto 패키지 임포트

import com.zoop.backend.domain.dto.CandidateSignupRequest; // repository 패키지 임포트
import com.zoop.backend.domain.dto.CompanyAdminSignupRequest; // repository 패키지 임포트
import com.zoop.backend.domain.dto.LoginRequest; // repository 패키지 임포트 (CompanyAdmin에서 참조)
import com.zoop.backend.domain.dto.LoginResponse;
import com.zoop.backend.domain.entity.Candidate; // 의존성 주입 어노테이션
import com.zoop.backend.domain.entity.Company; // Spring Security의 PasswordEncoder 주입 (비밀번호 해싱/검증)
import com.zoop.backend.domain.entity.CompanyAdmin; // Service 컴포넌트임을 나타내는 어노테이션
import com.zoop.backend.repository.CandidateRepository; // 트랜잭션 관리 어노테이션
import com.zoop.backend.repository.CompanyAdminRepository; // java.sql.Timestamp 사용
import com.zoop.backend.repository.CompanyRepository;

import lombok.Builder; // java.util.Date 사용 (CandidateRegistrationDate)

/**
 * 인증(Authentication) 및 회원 가입(Registration) 관련 비즈니스 로직을 처리하는 서비스 클래스입니다.
 * 클라이언트로부터 받은 요청 데이터를 처리하고, Repository를 통해 데이터베이스와 상호작용하며,
 * 결과를 Controller로 반환합니다. 비밀번호는 Spring Security의 PasswordEncoder를 사용하여 안전하게 해싱합니다.
 */
@Service // 이 클래스가 서비스 계층의 컴포넌트임을 Spring에게 알립니다. Spring 컨테이너에 빈으로 등록됩니다.
@Builder
public class AuthService {

    // 필요한 Repository 및 유틸리티 클래스를 주입받을 필드입니다.
    private final CandidateRepository candidateRepository;
    private final CompanyAdminRepository companyAdminRepository;
    private final PasswordEncoder passwordEncoder; // 비밀번호 해싱/검증을 위해 주입 (SecurityConfig에서 빈으로 등록)
    private final CompanyRepository companyRepository; // Company 엔티티 조회를 위해 주입
    // private final JwtTokenProvider jwtTokenProvider; // TODO: JWT 구현 시 필요 (별도 파일 작성 및 빈 등록)

    // 생성자 주입 (@Autowired는 단일 생성자의 경우 생략 가능하지만 명시적으로 붙여주는 것도 좋습니다)
    // Spring 컨테이너가 이 생성자를 호출할 때 필요한 빈들을 찾아서 인자로 주입해줍니다.
    @Autowired
    public AuthService(CandidateRepository candidateRepository,
                       CompanyAdminRepository companyAdminRepository,
                       PasswordEncoder passwordEncoder,
                       CompanyRepository companyRepository
                       /*, JwtTokenProvider jwtTokenProvider*/) { // TODO: JWT 구현 시 인자 추가
        this.candidateRepository = candidateRepository;
        this.companyAdminRepository = companyAdminRepository;
        this.passwordEncoder = passwordEncoder;
        this.companyRepository = companyRepository; // CompanyRepository 주입
        // this.jwtTokenProvider = jwtTokenProvider; // TODO: JWT 구현 시 필드 할당
    }

    /**
     * 개인 후보자 회원 가입 로직을 수행합니다.
     * 회원 가입 요청 DTO를 받아 유효성 검사(컨트롤러에서 @Valid로 1차 검사) 및 중복 확인 후,
     * 비밀번호를 해싱하여 Entity로 변환하고 데이터베이스에 저장합니다.
     *
     * @param request 개인 후보자 회원 가입 요청 DTO
     * @return 데이터베이스에 저장된 Candidate Entity 객체
     * @throws RuntimeException 이미 존재하는 사용자 정보(깃허브 로그인 ID 또는 이메일)일 경우 발생
     */
    @Transactional // 이 메소드 내의 모든 데이터베이스 작업(조회, 저장)은 하나의 트랜잭션으로 묶여 원자성을 보장합니다.
    public Candidate signupCandidate(CandidateSignupRequest request) {
        // 1. 중복 확인 (깃허브 로그인 ID 또는 이메일)
        // Repository 메소드를 호출하여 해당 정보로 Candidate 엔티티가 이미 데이터베이스에 존재하는지 확인합니다.
        // findBy... 메소드는 보통 Optional<Entity>를 반환하므로 isPresent() 메소드로 존재 여부를 확인합니다.
        if (candidateRepository.findByGithubLogin(request.getGithubLogin()).isPresent() ||
            candidateRepository.findByCandidateEmail(request.getCandidateEmail()).isPresent()) {
            // 이미 존재하는 사용자인 경우, RuntimeException을 발생시켜 Controller에게 알리고 회원 가입을 중단합니다.
            throw new RuntimeException("이미 존재하는 개인 사용자입니다. (깃허브 ID 또는 이메일)"); // 또는 사용자 정의 예외 클래스를 사용하는 것이 더 좋습니다.
        }

        // 2. DTO -> Entity 변환 및 비밀번호 해싱
        // 회원 가입 요청 DTO(CandidateSignupRequest)의 데이터를 기반으로 Candidate Entity 객체를 생성합니다.
        // Builder 패턴을 사용하면 객체 생성 시 가독성이 좋습니다.
        Candidate candidate = Candidate.builder()
                .githubLogin(request.getGithubLogin())
                .candidateEmail(request.getCandidateEmail())
                // **비밀번호 해싱**: 사용자로부터 받은 평문 비밀번호를 Spring Security의 PasswordEncoder로 해싱합니다.
                // 데이터베이스에는 절대 평문 비밀번호를 저장하면 안 됩니다.
                .candidatePassword(passwordEncoder.encode(request.getCandidatePassword()))
                .candidateName(request.getCandidateName()) // 선택 사항 필드
                .candidatePhoneNumber(request.getCandidatePhoneNumber()) // 선택 사항 필드
                // 생성 시각 관련 필드 설정 (데이터베이스 테이블에 기본값으로 SYSTIMESTAMP 등이 설정되어 있다면 생략 가능)
                .candidateRegistrationDate(new Date()) // java.util.Date 사용 (DB DATE 타입)
                .candidateCreatedAt(new Timestamp(System.currentTimeMillis())) // java.sql.Timestamp 사용 (DB TIMESTAMP 타입)
                .candidateUpdatedAt(new Timestamp(System.currentTimeMillis())) // java.sql.Timestamp 사용 (DB TIMESTAMP 타입)
                .build();

        // 3. 데이터 저장
        // Repository의 save() 메소드를 사용하여 새로 생성한 Candidate Entity 객체를 데이터베이스에 삽입(INSERT)합니다.
        return candidateRepository.save(candidate); // 데이터베이스에 저장된 Candidate Entity 객체 (PK 값이 채워진 상태)를 반환합니다.
    }

    /**
     * 기업 관리자 회원 가입 로직을 수행합니다.
     * 회원 가입 요청 DTO를 받아 유효성 검사 및 중복 확인 후,
     * 비밀번호를 해싱하고 유효한 회사에 연결하여 데이터베이스에 저장합니다.
     *
     * @param request 기업 관리자 회원 가입 요청 DTO
     * @return 데이터베이스에 저장된 CompanyAdmin Entity 객체
     * @throws RuntimeException 이미 존재하는 관리자 정보(로그인 ID 또는 이메일)이거나 유효하지 않은 회사 ID일 경우 발생
     */
     @Transactional
    public CompanyAdmin signupCompanyAdmin(CompanyAdminSignupRequest request) {
         // 1. 중복 확인 (관리자 로그인 ID 또는 이메일)
         // Repository 메소드를 호출하여 해당 정보로 CompanyAdmin 엔티티가 이미 데이터베이스에 존재하는지 확인합니다.
         if (companyAdminRepository.findByCompanyAdminLogin(request.getCompanyAdminLogin()).isPresent() ||
            companyAdminRepository.findByCompanyAdminEmail(request.getCompanyAdminEmail()).isPresent()) {
            throw new RuntimeException("이미 존재하는 기업 관리자입니다. (로그인 ID 또는 이메일)"); // 또는 사용자 정의 예외 클래스 사용
         }

         // 2. 회사 엔티티 조회 (요청받은 companyId로 찾기)
         // 기업 관리자는 반드시 유효한 회사에 소속되어야 하므로, 요청 DTO에 포함된 companyId로 Company 엔티티를 조회합니다.
         // findById는 Optional<Company>를 반환합니다. orElseThrow를 사용하여 조회 결과가 없을 경우 예외를 발생시킵니다.
         Company company = companyRepository.findById(request.getCompanyId())
                                .orElseThrow(() -> new RuntimeException("유효하지 않은 회사 ID입니다.")); // 또는 사용자 정의 예외

         // 3. DTO -> Entity 변환 및 비밀번호 해싱
         // 회원 가입 요청 DTO(CompanyAdminSignupRequest)의 데이터를 기반으로 CompanyAdmin Entity 객체를 생성합니다.
          CompanyAdmin admin = CompanyAdmin.builder()
            .company(company) // 조회한 Company 엔티티 객체를 CompanyAdmin 엔티티의 company 필드에 설정합니다.
            // 엔티티 필드 이름 'loginId'에 해당하는 builder 메서드를 호출합니다.
            .loginId(request.getCompanyAdminLogin()) // <-- companyAdminLogin 대신 loginId로 수정
            // 엔티티 필드 이름 'email'에 해당하는 builder 메서드를 호출합니다.
            .email(request.getCompanyAdminEmail()) // <-- companyAdminEmail 대신 email로 수정
            // 엔티티 필드 이름 'password'에 해당하는 builder 메서드를 호출합니다.
            .password(passwordEncoder.encode(request.getCompanyAdminPassword())) // <-- companyAdminPassword 대신 password로 수정
            // 엔티티 필드 이름 'name'에 해당하는 builder 메서드를 호출합니다.
            .name(request.getCompanyAdminName()) // <-- companyAdminName 대신 name으로 수정
            // 생성 시각 관련 필드 설정 (아래 2번 수정 내용 반영)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();

         // 4. 데이터 저장
         // Repository의 save() 메소드를 사용하여 새로 생성한 CompanyAdmin Entity 객체를 데이터베이스에 삽입(INSERT)합니다.
         return companyAdminRepository.save(admin); // 데이터베이스에 저장된 CompanyAdmin Entity 객체 (PK 값이 채워진 상태)를 반환합니다.
    }


    /**
     * 사용자 로그인 로직을 수행합니다.
     * 로그인 요청 DTO(아이디, 비밀번호, 사용자 유형 포함)를 받아
     * 해당 사용자 유형의 Repository에서 아이디로 사용자를 조회하고, 비밀번호를 검증합니다.
     * 인증 성공 시 JWT 토큰을 생성하여 LoginResponse DTO에 담아 반환합니다.
     *
     * @param request 로그인 요청 DTO (loginId, password, userType 포함)
     * @return 로그인 성공 시 LoginResponse DTO (JWT 토큰 포함)
     * @throws IllegalArgumentException 유효하지 않은 사용자 유형("candidate", "company" 외의 값)일 경우 발생
     * @throws RuntimeException 사용자 조회 실패(아이디 없음) 또는 비밀번호 불일치일 경우 발생
     */
    @Transactional(readOnly = true) // 데이터 변경 없이 조회 작업만 수행하므로 readOnly = true로 설정하여 성능 최적화에 도움을 줍니다.
    public LoginResponse login(LoginRequest request) {
         Object user; // 로그인 성공한 Candidate 또는 CompanyAdmin 객체 저장 (두 엔티티를 공통으로 다루기 위해 Object 사용 또는 인터페이스 활용)
         Long userId; // 로그인한 사용자의 고유 ID (CandidateId 또는 CompanyAdminId) 저장
         String actualUserType; // 데이터베이스에서 확인된 사용자의 실제 유형 ("candidate" 또는 "company")

         // 1. 요청 DTO의 userType에 따라 해당하는 Repository에서 아이디(loginId)로 사용자 조회
         if ("candidate".equals(request.getUserType())) {
             // 사용자 유형이 "candidate"인 경우, CandidateRepository에서 loginId(GitHub 로그인 ID로 사용)로 Candidate 엔티티를 조회합니다.
             Candidate candidate = candidateRepository.findByGithubLogin(request.getLoginId())
                                       .orElseThrow(() -> new RuntimeException("개인 사용자를 찾을 수 없습니다.")); // 조회 결과가 없으면 RuntimeException 발생
             user = candidate; // 조회된 Candidate 객체를 user 변수에 할당
             userId = candidate.getCandidateId(); // Candidate의 ID를 userId에 저장
             actualUserType = "candidate"; // 실제 사용자 유형을 저장

         } else if ("company".equals(request.getUserType())) {
             // 사용자 유형이 "company"인 경우, CompanyAdminRepository에서 loginId(관리자 로그인 ID로 사용)로 CompanyAdmin 엔티티를 조회합니다.
             CompanyAdmin admin = companyAdminRepository.findByCompanyAdminLogin(request.getLoginId())
                                     .orElseThrow(() -> new RuntimeException("기업 관리자를 찾을 수 없습니다.")); // 조회 결과가 없으면 RuntimeException 발생
             user = admin; // 조회된 CompanyAdmin 객체를 user 변수에 할당
             userId = admin.getCompanyAdminId(); // CompanyAdmin의 ID를 userId에 저장
             actualUserType = "company"; // 실제 사용자 유형을 저장

         } else {
             // 요청 DTO의 userType 값이 "candidate" 또는 "company"가 아닌 경우
             // Controller에서 @Valid 어노테이션으로 1차 유효성 검사가 수행되지만, 서비스 로직에서도 유효하지 않은 값이라면 IllegalArgumentException 발생
             throw new IllegalArgumentException("유효하지 않은 사용자 유형입니다. userType은 'candidate' 또는 'company'만 허용됩니다.");
         }

        // 2. 비밀번호 검증
        String storedHashedPassword;
        // 조회된 user 객체의 실제 타입(Candidate 또는 CompanyAdmin)에 따라 해당 엔티티에서 해시된 비밀번호를 가져옵니다.
        if (user instanceof Candidate) {
            storedHashedPassword = ((Candidate) user).getCandidatePassword();
        } else { // user instanceof CompanyAdmin
            storedHashedPassword = ((CompanyAdmin) user).getPassword();
        }

        // 사용자가 로그인 요청으로 보낸 평문 비밀번호와 데이터베이스에 저장된 해시된 비밀번호를 비교합니다.
        // Spring Security의 PasswordEncoder.matches() 메소드를 사용하면 안전하게 비교할 수 있습니다.
        if (!passwordEncoder.matches(request.getPassword(), storedHashedPassword)) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다."); // 비밀번호 불일치 시 RuntimeException 발생
        }

        // 3. 로그인 성공 -> JWT 토큰 생성 및 LoginResponse DTO 반환
        // TODO: 실제 JWT 토큰 생성 로직을 구현하고 LoginResponse DTO에 담아 반환합니다.
        // JWT 생성 시 JwtTokenProvider와 같은 유틸리티 클래스를 사용하는 것이 일반적입니다.
        // 토큰에는 사용자의 고유 식별 정보(userId), 유형(actualUserType), 권한 정보 등을 포함시킬 수 있습니다.
        // 로그인 유지 기능(request.isKeepLoggedIn() 상태) 상태에 따라 토큰의 만료 시간을 다르게 설정할 수 있습니다.
        // String token = jwtTokenProvider.generateToken(user, actualUserType, request.isKeepLoggedIn()); // 예시: JWT 생성기 사용

        // JWT 구현 전 테스트를 위해 임시 LoginResponse DTO를 반환합니다.
        return new LoginResponse(
            "임시_JWT_토큰_" + userId + "_" + actualUserType, // TODO: 실제 생성된 JWT 토큰 문자열로 교체
            actualUserType, // 로그인한 사용자 유형
            userId, // 로그인한 사용자 ID
            "로그인 성공" // 클라이언트에게 보여줄 성공 메시지
        );
    }
}



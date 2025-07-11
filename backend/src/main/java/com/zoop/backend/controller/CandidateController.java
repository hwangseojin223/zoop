package com.zoop.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import com.zoop.backend.domain.dto.CandidateSignupRequest;
import com.zoop.backend.domain.dto.finding.FindGithubLoginRequest;
import com.zoop.backend.domain.dto.finding.FindGithubLoginResponse;
import com.zoop.backend.domain.entity.Candidate;
import com.zoop.backend.domain.entity.Invitation;
import com.zoop.backend.domain.entity.GithubSearchResult;
import com.zoop.backend.repository.CandidateRepository;
import com.zoop.backend.repository.InvitationRepository;
import com.zoop.backend.repository.GithubSearchResultRepository;
import com.zoop.backend.service.CandidateService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Tag(name="CandidateController", description = "개인회원(후보자) 관련 API")
@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
public class CandidateController {

    private final CandidateService candidateService;
    private final CandidateRepository candidateRepository;
    private final InvitationRepository invitationRepository;
    private final GithubSearchResultRepository githubSearchResultRepository;

    // 1. 후보자 추가
    @Operation(summary = "개인회원 정보 등록", description = "새로운 개인회원(후보자) 정보를 시스템에 등록합니다.")
    @ApiResponses(value={
        @ApiResponse(responseCode="201", description="개인회원 정보 등록 성공 및 등록된 개인회원 정보 반환",
            content = @Content(schema = @Schema(implementation = Candidate.class))),
        @ApiResponse(responseCode = "400", description = "잘못된 요청(예: 필수 필드 누락, 데이터 형식 오류 등",
            content = @Content(schema = @Schema(implementation = String.class))),
        @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @PostMapping("/process")
    public ResponseEntity<?> addCandidate(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "등록할 개인회원(후보자) 정보",
            required = true,
            content = @Content(schema = @Schema(implementation = Candidate.class))
        )
        @RequestBody CandidateSignupRequest request) {
        try {
            // 1. 입력받은 candidate 정보 출력
            log.info("회원가입 요청: {}", request.toString());
            
            // 2. Candidate 객체 생성(엔티티로 변환)
            Candidate candidate = new Candidate();
            candidate.setCandidateName(request.getCandidateName());
            candidate.setCandidateEmail(request.getCandidateEmail());
            candidate.setCandidatePassword(request.getCandidatePassword());
            candidate.setCandidatePhoneNumber(request.getCandidatePhoneNumber());
            candidate.setCandidateRegistrationDate(request.getCandidateRegistrationDate());
            candidate.setCandidateUpdatedAt(request.getCandidateUpdatedAt());
            candidate.setCandidateCreatedAt(request.getCandidateCreatedAt());
            candidate.setGithubLogin(request.getGithubLogin());
            candidate.setGoogleId(request.getGoogleId());
            
            // 3. 저장
            Candidate savedCandidate = candidateService.save(candidate);

            // 4. 토큰기반 Invitation 업데이트
            // 만약 InvitationToken이 전달된다면
            if(request.getInvitationToken() != null){  
                
                // 토큰을 기반하여 Invitation조회
                Optional<Invitation> optional = invitationRepository.findByInvitationUniqueToken(request.getInvitationToken());

                // 만약 그런 Invitation이 존재한다면
                if (optional.isPresent()) {
                    Invitation invitation = optional.get();     // 전달받은 invitation

                    // 만약 candidateId가 비어있다면
                    if(invitation.getCandidateId() == null) {

                        // candidateId 업데이트
                        invitation.setCandidateId(savedCandidate.getCandidateId());
                        invitationRepository.save(invitation);
                    }
                }
            }

            // 저장된 후보자와 함께 201 CREATED 상태 코드 반환
            return new ResponseEntity<>(savedCandidate, HttpStatus.CREATED);
            
        } catch (RuntimeException e) {
            // 중복 이메일, 중복 GitHub 로그인 등의 비즈니스 예외 처리
            log.warn("회원가입 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", e.getMessage()));
                
        } catch (Exception e) {
            // 기타 예외 처리
            log.error("회원가입 중 예상치 못한 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "회원가입 처리 중 오류가 발생했습니다."));
        }
    }

    // 2. 회원가입시 아이디 중복체크를 위한 메서드
    @GetMapping("/check-id")
    public ResponseEntity<String> checkGithubLoginDuplicate(@RequestParam String githubLogin) {
        boolean isDuplicate = candidateService.isDuplicateGithubLogin(githubLogin);
        if (isDuplicate) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("이미 사용 중인 아이디입니다.");
        } else {
            return ResponseEntity.ok("사용 가능한 아이디입니다.");
        }
    }

    // 3. 링크를 타고 온 회원의 경우 회원가입 되어있는지 확인하는 메서드
    @GetMapping("/check-exists")
    public ResponseEntity<Map<String, Boolean>> checkCandidateExists(@RequestParam String githubLogin) {
        boolean exists = candidateRepository.existsByGithubLogin(githubLogin);

        if (exists) {
            Candidate candidate = candidateRepository.findByGithubLogin(githubLogin).orElseThrow();
            // invitation 테이블에서 githubLogin이 같은 초대 찾기
            List<Invitation> invitations = invitationRepository.findAllByGithubLogin(githubLogin);
            for (Invitation invitation : invitations) {
                if (invitation.getCandidateId() == null) {
                    invitation.setCandidateId(candidate.getCandidateId());
                    invitationRepository.save(invitation);
                    log.info("candidate_id: {}", candidate.getCandidateId());
                }
            }
        }
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    // 4. 후보자 ID로 조회
    @GetMapping("/{candidateId}")
    public ResponseEntity<?> getCandidateById(@PathVariable Long candidateId) {
        log.info("🔍 candidateId={}으로 후보자 정보 조회 요청", candidateId);
        
        try {
            Optional<Candidate> candidate = candidateService.findById(candidateId);
            if (candidate.isPresent()) {
                log.info("✅ 후보자 정보 조회 성공: {}", candidate.get().getCandidateName());
                return ResponseEntity.ok(candidate.get());
            } else {
                log.warn("❌ candidateId={}에 해당하는 후보자를 찾을 수 없습니다.", candidateId);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("후보자 조회 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 5. 아이디 찾기
    @PostMapping("/find-id")
    public FindGithubLoginResponse findGithubLogin(@RequestBody FindGithubLoginRequest request) {
        return candidateService.findGithubLogin(request);
    }

    // 6. GitHub 로그인으로 이메일 조회
    @GetMapping("/email/{githubLogin}")
    public ResponseEntity<?> getEmailByGithubLogin(@PathVariable String githubLogin) {
        log.info("🔍 githubLogin={}으로 이메일 조회 요청", githubLogin);
    
        // 1. candidates 테이블에서 조회
        Optional<Candidate> candidate = candidateRepository.findByGithubLogin(githubLogin);
        if (candidate.isPresent()) {
            log.info("✅ candidates 테이블에서 이메일 조회 성공: {}", candidate.get().getCandidateEmail());
            return ResponseEntity.ok(Map.of("email", candidate.get().getCandidateEmail()));
        }
        
        // 2. 없으면 github_search_results에서 조회
        List<GithubSearchResult> gsrList = githubSearchResultRepository.findByGithubLogin(githubLogin);
        if (!gsrList.isEmpty() && gsrList.get(0).getCandidateEmail() != null) {
            log.info("✅ github_search_results 테이블에서 이메일 조회 성공: {}", gsrList.get(0).getCandidateEmail());
            return ResponseEntity.ok(Map.of("email", gsrList.get(0).getCandidateEmail()));
        }
        
        log.warn("❌ githubLogin={}에 해당하는 이메일을 찾을 수 없습니다.", githubLogin);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "이메일을 찾을 수 없습니다."));
    }

}

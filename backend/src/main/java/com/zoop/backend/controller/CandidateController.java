package com.zoop.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.zoop.backend.domain.entity.Candidate;
import com.zoop.backend.service.CandidateService;
import com.zoop.backend.repository.CandidateRepository;
import com.zoop.backend.repository.GithubSearchResultRepository;
import com.zoop.backend.domain.entity.GithubSearchResult;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Tag(name="CandidateController", description = "개인회원(후보자) 관련 API")
@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
public class CandidateController {

    private final CandidateService candidateService;
    private final CandidateRepository candidateRepository;
    private final GithubSearchResultRepository githubSearchResultRepository;
    private static final Logger log = LoggerFactory.getLogger(CandidateController.class);

    // // 모든 후보자 리스트 조회
    // @GetMapping
    // public ResponseEntity<List<Candidate>> getAllCandidates() {
    //     List<Candidate> candidates = candidateService.findAll();
    //     if (candidates.isEmpty()) {
    //         return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 데이터가 없으면 204 상태 코드
    //     }
    //     return new ResponseEntity<>(candidates, HttpStatus.OK); // 200 상태 코드
    // }

    // 후보자 추가
    @Operation(summary = "개인회원 정보 등록", description = "새로운 개인회원(후보자) 정보를 시스템에 등록합니다.")
    @ApiResponses(value={
        @ApiResponse(responseCode="201", description="개인회우너 정보 등록 성공 및 등록된 개인회원 정보 반환",
            content = @Content(schema = @Schema(implementation = Candidate.class))),
        @ApiResponse(responseCode = "400", description = "잘못된 요청(예: 필수 필드 누락, 데이터 형식 오류 등",
            content = @Content(schema = @Schema(implementation = String.class))),
        @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @PostMapping("/process")
    public ResponseEntity<Candidate> addCandidate(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "등록할 개인회원(후보자) 정보",
            required = true,
            content = @Content(schema = @Schema(implementation = Candidate.class))
        )
        @RequestBody Candidate candidate) {
        // 입력받은 candidate 정보 출력
        System.out.println(candidate.toString());
        
        // 후보자 저장
        Candidate savedCandidate = candidateService.save(candidate);
        
        // 저장된 후보자와 함께 201 CREATED 상태 코드 반환
        return new ResponseEntity<>(savedCandidate, HttpStatus.CREATED);
    }

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

package com.zoop.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zoop.backend.domain.dto.CareerDataDto;
import com.zoop.backend.domain.dto.PortfolioSubmissionResponseDto;
import com.zoop.backend.service.PortfolioService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "PortfolioController", description = "포트폴리오 제출 관련 API")
@RestController
@RequestMapping("/api/portfolios")
public class PortfolioController {

    private final PortfolioService portfolioService;
    private final ObjectMapper objectMapper;
    
    @Autowired
    public PortfolioController(PortfolioService portfolioService, ObjectMapper objectMapper) {
        this.portfolioService = portfolioService;
        this.objectMapper = objectMapper;
    }
    
    @Operation(summary = "포트폴리오 제출", description = "지원자가 포트폴리오와 관련 정보를 제출합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "포트폴리오 제출 성공",
            content = @Content(schema = @Schema(implementation = PortfolioSubmissionResponseDto.class))),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 (필수 동의 누락 등)"),
        @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @PostMapping
    public ResponseEntity<?> submitPortfolio(
            @Parameter(description = "공고 ID", required = true)
            @RequestParam("postId") Integer postId,
            
            @Parameter(description = "지원자 ID", required = true)
            @RequestParam("candidateId") Integer candidateId,
            
            @Parameter(description = "포트폴리오 파일 (필수)")
            @RequestParam(value = "portfolioFile", required = true) MultipartFile portfolioFile,
            
            @Parameter(description = "포트폴리오 내용 설명")
            @RequestParam("portfolioContent") String portfolioContent,
            
            @Parameter(description = "포트폴리오 URL (선택사항)")
            @RequestParam("portfolioUrl") String portfolioUrl,
            
            @Parameter(description = "경력 정보 (JSON 형식)")
            @RequestParam("careerData") String careerDataJson,
            
            @Parameter(description = "지원 목표 및 동기")
            @RequestParam("goalStatement") String goalStatement,
            
            @Parameter(description = "직무 적합성")
            @RequestParam("suitabilityStatement") String suitabilityStatement,
            
            @Parameter(description = "필수 개인정보 수집 동의")
            @RequestParam("agreeRequiredPersonal") Boolean agreeRequiredPersonal,
            
            @Parameter(description = "선택 개인정보 수집 동의")
            @RequestParam("agreeOptionalPersonal") Boolean agreeOptionalPersonal,
            
            @Parameter(description = "추후 포지션 제안 동의")
            @RequestParam("agreeFutureProposals") Boolean agreeFutureProposals,
            
            @Parameter(description = "채용정보 수신 동의")
            @RequestParam("agreeReceiveRecruitmentInfo") Boolean agreeReceiveRecruitmentInfo
    ) {
        try {
            System.out.println("=== [DEBUG] PortfolioController.submitPortfolio() 진입 ===");
            System.out.println("[PortfolioController] careerDataJson(raw): " + careerDataJson);
            // 파일 상태 로그 출력
            System.out.println("=== PortfolioController.submitPortfolio() 호출됨 ===");
            System.out.println("[PortfolioController] portfolioFile: " + (portfolioFile != null ? portfolioFile.getOriginalFilename() + " (크기: " + portfolioFile.getSize() + " bytes)" : "null"));
            System.out.println("[PortfolioController] postId: " + postId);
            System.out.println("[PortfolioController] candidateId: " + candidateId);
            
            // JSON 문자열을 객체로 변환
            CareerDataDto careerData = objectMapper.readValue(careerDataJson, CareerDataDto.class);
            
            // 포트폴리오 저장 서비스 호출
            PortfolioSubmissionResponseDto response = portfolioService.submitPortfolio(
                postId, 
                candidateId, 
                portfolioFile, 
                portfolioContent, 
                portfolioUrl, 
                careerData, 
                goalStatement, 
                suitabilityStatement, 
                agreeRequiredPersonal, 
                agreeOptionalPersonal, 
                agreeFutureProposals, 
                agreeReceiveRecruitmentInfo
            );
            
            // 리다이렉션 URL 추가
            response.setRedirectUrl("/candidate/dashboard");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("포트폴리오 제출 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    @Operation(summary = "지원자별 포트폴리오 조회", description = "특정 지원자가 제출한 모든 포트폴리오를 조회합니다.")
    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<?> getPortfoliosByCandidate(
            @Parameter(description = "지원자 ID", required = true)
            @PathVariable Integer candidateId
    ) {
        try {
            return ResponseEntity.ok(portfolioService.getPortfoliosByCandidate(candidateId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("포트폴리오 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    @Operation(summary = "포트폴리오 상세 조회", description = "특정 포트폴리오의 상세 정보를 조회합니다.")
    @GetMapping("/{portfolioId}")
    public ResponseEntity<?> getPortfolio(
            @Parameter(description = "포트폴리오 ID", required = true)
            @PathVariable Integer portfolioId
    ) {
        try {
            return portfolioService.getPortfolio(portfolioId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("포트폴리오 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /** 합친 이후 */
    @GetMapping("/{jobCandidateId}/submission-date")
    public ResponseEntity<?> getPortfolioSubmissionDate(@PathVariable Long jobCandidateId) {
        return portfolioService.getSubmissionDate(jobCandidateId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body("해당 후보자의 포트폴리오가 존재하지 않습니다."));
    }

    @Operation(summary = "jobCandidateId로 포트폴리오 조회", description = "jobCandidateId를 사용하여 포트폴리오 정보를 조회합니다.")
    @GetMapping("/job-candidate/{jobCandidateId}")
    public ResponseEntity<?> getPortfolioByJobCandidateId(
            @Parameter(description = "jobCandidateId", required = true)
            @PathVariable Long jobCandidateId
    ) {
        try {
            return portfolioService.getPortfolioByJobCandidateId(jobCandidateId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("포트폴리오 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}

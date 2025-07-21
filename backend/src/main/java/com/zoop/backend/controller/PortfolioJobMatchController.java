package com.zoop.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.zoop.backend.domain.entity.AiAnalysisResult;
import com.zoop.backend.domain.entity.JobCandProgress;
import com.zoop.backend.domain.entity.PortfolioJobMatch;
import com.zoop.backend.repository.AiAnalysisResultRepository;
import com.zoop.backend.repository.JobCandProgressRepository;
import com.zoop.backend.repository.PortfolioJobMatchRepository;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/portfolio-job-matches")
@CrossOrigin(origins = "http://localhost:3000")
@Slf4j
public class PortfolioJobMatchController {
    
    @Autowired
    private PortfolioJobMatchRepository portfolioJobMatchRepository;
    
    @Autowired
    private JobCandProgressRepository jobCandProgressRepository;
    
    @Autowired
    private AiAnalysisResultRepository aiAnalysisResultRepository;
    
    @PostMapping
    public ResponseEntity<?> savePortfolioJobMatch(@RequestBody Map<String, Object> request) {
        try {
            log.info("포트폴리오-채용공고 매칭 결과 저장 시작: {}", request);
            
            Long portfolioId = Long.valueOf(request.get("portfolioId").toString());
            Long jobPostingId = Long.valueOf(request.get("jobPostingId").toString());
            Double matchingScore = Double.valueOf(request.get("matchingScore").toString());
            String matchingReason = (String) request.get("matchingReason");
            
            // 80점 미만은 저장하지 않음
            if (matchingScore < 80.0) {
                log.info("매칭 점수 {}점: 80점 미만이므로 저장하지 않음", matchingScore);
                return ResponseEntity.noContent().build();
            }
            // PortfolioJobMatch 엔티티 생성 및 저장
            PortfolioJobMatch match = PortfolioJobMatch.builder()
                    .candPortfolioId(portfolioId)
                    .postId(jobPostingId)
                    .matchingScore(matchingScore)
                    .matchingReason(matchingReason)
                    .build();
            
            PortfolioJobMatch savedMatch = portfolioJobMatchRepository.save(match);
            log.info("포트폴리오-채용공고 매칭 결과 저장 완료: matchId={}", savedMatch.getMatchId());
            
            // job_cand_progress 테이블의 job_cand_curr_stage를 '2y'로 업데이트
            updateJobCandProgressStage(portfolioId, jobPostingId);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(savedMatch);
            
        } catch (Exception e) {
            log.error("포트폴리오-채용공고 매칭 결과 저장 실패: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("매칭 결과 저장 중 오류가 발생했습니다.");
        }
    }
    
    private void updateJobCandProgressStage(Long portfolioId, Long jobPostingId) {
        try {
            // cand_portfolio_id로 JobCandProgress 조회
            List<JobCandProgress> progressList = jobCandProgressRepository.findByCandPortfolioId(portfolioId);
            
            for (JobCandProgress progress : progressList) {
                // post_id가 일치하는 경우에만 stage 업데이트
                if (progress.getPost().getPostId().equals(jobPostingId)) {
                    String currentStage = progress.getJobCandCurrStage();
                    if ("0".equals(currentStage) || "1n".equals(currentStage) || "2n".equals(currentStage)) {
                        log.info("PortfolioJobMatch Stage 업데이트: {} → 2y", currentStage);
                        progress.setJobCandCurrStage("2y");
                        jobCandProgressRepository.save(progress);
                    }
                    break; // 첫 번째 일치하는 항목만 업데이트
                }
            }
        } catch (Exception e) {
            log.error("JobCandProgress stage 업데이트 실패: {}", e.getMessage(), e);
        }
    }
    
    @GetMapping("/portfolio/{portfolioId}")
    public ResponseEntity<?> getMatchesByPortfolioId(@PathVariable Long portfolioId) {
        try {
            List<PortfolioJobMatch> matches = portfolioJobMatchRepository.findByCandPortfolioIdOrderByMatchingScoreDesc(portfolioId);
            return ResponseEntity.ok(matches);
        } catch (Exception e) {
            log.error("포트폴리오 매칭 결과 조회 중 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("매칭 결과 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    @GetMapping("/post/{postId}")
    public ResponseEntity<?> getMatchesByPostId(@PathVariable Long postId) {
        try {
            List<PortfolioJobMatch> matches = portfolioJobMatchRepository.findByPostIdOrderByMatchingScoreDesc(postId);
            return ResponseEntity.ok(matches);
        } catch (Exception e) {
            log.error("공고별 매칭 결과 조회 중 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("매칭 결과 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    @GetMapping("/top-matches/{postId}")
    public ResponseEntity<?> getTopMatchesByPostId(@PathVariable Long postId, 
                                                   @RequestParam(defaultValue = "30.0") Double minScore) {
        try {
            List<PortfolioJobMatch> matches = portfolioJobMatchRepository.findTopMatchesByPostId(postId, minScore);
            return ResponseEntity.ok(matches);
        } catch (Exception e) {
            log.error("상위 매칭 결과 조회 중 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("매칭 결과 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    @GetMapping("/portfolio/{portfolioId}/job-candidate-id")
    public ResponseEntity<?> getJobCandidateIdByPortfolio(@PathVariable Long portfolioId) {
        try {
            // portfolio_id로 job_cand_progress에서 job_candidate_id 조회
            Optional<JobCandProgress> progress = jobCandProgressRepository
                    .findByCandPortfolioId(portfolioId)
                    .stream()
                    .findFirst();
            
            if (progress.isPresent()) {
                Map<String, Object> result = new HashMap<>();
                result.put("jobCandidateId", progress.get().getJobCandidateId());
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            log.error("job_candidate_id 조회 중 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("job_candidate_id 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @GetMapping("/candidate/{candidateId}/post/{postId}")
    public ResponseEntity<?> getCandidateMatchInfo(@PathVariable Integer candidateId, @PathVariable Long postId) {
        try {
            // 1. candidate_id로 cand_portfolio_id 조회
            Long candPortfolioId = jobCandProgressRepository.findByCandidate_CandidateId(candidateId.intValue())
                    .stream()
                    .filter(progress -> progress.getPost().getPostId().equals(postId))
                    .map(progress -> progress.getCandPortfolioId())
                    .findFirst()
                    .orElse(null);
            
            if (candPortfolioId == null) {
                return ResponseEntity.ok(Map.of("hasMatch", false));
            }
            
            // 2. 매칭 정보 조회
            PortfolioJobMatch match = portfolioJobMatchRepository.findByCandPortfolioIdAndPostId(candPortfolioId, postId)
                    .orElse(null);
            
            // 3. 포트폴리오 분석 정보 조회
            List<AiAnalysisResult> portfolioAnalysis = aiAnalysisResultRepository
                    .findByJobCandidateIdAndAnalysisType(candidateId.longValue(), "standalone_portfolio");
            
            Map<String, Object> result = new HashMap<>();
            result.put("hasMatch", match != null);
            
            if (match != null) {
                result.put("matchingScore", match.getMatchingScore());
                result.put("matchingReason", match.getMatchingReason());
                result.put("matchCreatedAt", match.getMatchCreatedAt());
            }
            
            if (!portfolioAnalysis.isEmpty()) {
                // 가장 최근 분석 결과 사용
                AiAnalysisResult latestAnalysis = portfolioAnalysis.get(0);
                result.put("portfolioAnalysis", latestAnalysis.getAnalysisData());
                result.put("portfolioAnalysisScore", latestAnalysis.getAnalysisScore());
                result.put("portfolioAnalysisDate", latestAnalysis.getAnalysisDate());
            }
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("후보자 매칭 정보 조회 중 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("매칭 정보 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
} 
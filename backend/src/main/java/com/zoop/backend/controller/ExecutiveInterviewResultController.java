package com.zoop.backend.controller;

import com.zoop.backend.domain.dto.ExecutiveInterviewResultDto;
import com.zoop.backend.domain.entity.ExecutiveInterviewResult;
import com.zoop.backend.service.ExecutiveInterviewResultService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/executive-interview/results")
@RequiredArgsConstructor
@Slf4j
public class ExecutiveInterviewResultController {
    
    private final ExecutiveInterviewResultService resultService;
    
    /**
     * 면접 결과 저장 또는 업데이트
     */
    @PostMapping
    public ResponseEntity<?> saveOrUpdateResult(@RequestBody ExecutiveInterviewResultDto request) {
        try {
            log.info("면접 결과 저장/업데이트 요청: scheduleId={}", request.getScheduleId());
            
            ExecutiveInterviewResult result = resultService.saveOrUpdateResult(request);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "면접 결과가 성공적으로 저장되었습니다.",
                "resultId", result.getResultId()
            ));
            
        } catch (Exception e) {
            log.error("면접 결과 저장 실패: error={}", e.getMessage());
            return ResponseEntity.internalServerError()
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    /**
     * 면접 일정 ID로 결과 조회
     */
    @GetMapping("/{scheduleId}")
    public ResponseEntity<?> getResultByScheduleId(@PathVariable Long scheduleId) {
        try {
            log.info("면접 결과 조회 요청: scheduleId={}", scheduleId);
            
            var result = resultService.getResultByScheduleId(scheduleId);
            
            if (result.isPresent()) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "result", result.get()
                ));
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            log.error("면접 결과 조회 실패: scheduleId={}, error={}", scheduleId, e.getMessage());
            return ResponseEntity.internalServerError()
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    /**
     * 모든 면접 결과 조회
     */
    @GetMapping
    public ResponseEntity<?> getAllResults() {
        try {
            log.info("모든 면접 결과 조회 요청");
            
            List<ExecutiveInterviewResultDto> results = resultService.getAllResults();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "results", results,
                "count", results.size()
            ));
            
        } catch (Exception e) {
            log.error("모든 면접 결과 조회 실패: error={}", e.getMessage());
            return ResponseEntity.internalServerError()
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    /**
     * 최종 결정별 결과 조회
     */
    @GetMapping("/decision/{decision}")
    public ResponseEntity<?> getResultsByDecision(@PathVariable String decision) {
        try {
            log.info("최종 결정별 결과 조회 요청: decision={}", decision);
            
            if (!"PASS".equals(decision) && !"FAIL".equals(decision)) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "유효하지 않은 결정입니다: " + decision));
            }
            
            List<ExecutiveInterviewResultDto> results = resultService.getResultsByDecision(decision);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "decision", decision,
                "results", results,
                "count", results.size()
            ));
            
        } catch (Exception e) {
            log.error("최종 결정별 결과 조회 실패: decision={}, error={}", decision, e.getMessage());
            return ResponseEntity.internalServerError()
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    /**
     * 최종 합격/불합격 결정
     */
    @PostMapping("/{scheduleId}/final-decision")
    public ResponseEntity<?> makeFinalDecision(
            @PathVariable Long scheduleId,
            @RequestBody Map<String, String> request) {
        try {
            String decision = request.get("decision");
            String notes = request.get("notes");
            
            log.info("최종 결정 요청: scheduleId={}, decision={}", scheduleId, decision);
            
            if (decision == null || decision.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "결정이 필요합니다."));
            }
            
            ExecutiveInterviewResult result = resultService.makeFinalDecision(scheduleId, decision, notes);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "최종 결정이 성공적으로 저장되었습니다.",
                "resultId", result.getResultId(),
                "finalDecision", result.getFinalDecision()
            ));
            
        } catch (Exception e) {
            log.error("최종 결정 실패: scheduleId={}, error={}", scheduleId, e.getMessage());
            return ResponseEntity.internalServerError()
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    /**
     * 면접 분석 결과 조회 (AI 분석 + 면접 일정 정보)
     */
    @GetMapping("/{scheduleId}/analysis")
    public ResponseEntity<?> getInterviewAnalysis(@PathVariable Long scheduleId) {
        try {
            log.info("면접 분석 결과 조회 요청: scheduleId={}", scheduleId);
            
            var result = resultService.getResultByScheduleId(scheduleId);
            
            if (result.isPresent()) {
                ExecutiveInterviewResultDto resultDto = result.get();
                
                // AI 분석 결과와 면접 일정 정보를 포함한 응답
                Map<String, Object> response = Map.of(
                    "success", true,
                    "scheduleId", scheduleId,
                    "result", resultDto,
                    "hasEvaluation", resultDto.getFinalDecision() != null
                );
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            log.error("면접 분석 결과 조회 실패: scheduleId={}, error={}", scheduleId, e.getMessage());
            return ResponseEntity.internalServerError()
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
} 
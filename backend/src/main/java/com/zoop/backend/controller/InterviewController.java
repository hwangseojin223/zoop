package com.zoop.backend.controller;

import com.zoop.backend.service.InterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/interview")
// 전역 CORS 설정 사용 (CorsConfig에서 관리)
public class InterviewController {

    @Autowired
    private InterviewService interviewService;

    @PostMapping("/candidate-ready-status")
    public ResponseEntity<?> updateCandidateReadyStatus(@RequestBody Map<String, Object> request) {
        try {
            String jobCandidateId = (String) request.get("jobCandidateId");
            String status = (String) request.get("status");
            String timestamp = (String) request.get("timestamp");
            
            System.out.println("지원자 준비 상태 업데이트 요청: " + jobCandidateId + " -> " + status);
            
            interviewService.updateCandidateStatus(jobCandidateId, status, timestamp);
            return ResponseEntity.ok().body(Map.of("message", "상태 업데이트 성공"));
        } catch (Exception e) {
            System.err.println("지원자 준비 상태 업데이트 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/candidate-status/{jobCandidateId}")
    public ResponseEntity<?> getCandidateStatus(@PathVariable String jobCandidateId) {
        try {
            System.out.println("지원자 상태 조회 요청: " + jobCandidateId);
            String status = interviewService.getCandidateStatus(jobCandidateId);
            return ResponseEntity.ok().body(Map.of("status", status));
        } catch (Exception e) {
            System.err.println("지원자 상태 조회 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}



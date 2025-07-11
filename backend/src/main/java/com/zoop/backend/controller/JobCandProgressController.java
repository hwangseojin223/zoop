package com.zoop.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zoop.backend.domain.dto.ResponderDto;
import com.zoop.backend.service.JobCandProgressService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/responder")
@RequiredArgsConstructor
public class JobCandProgressController {

    private final JobCandProgressService jobCandProgressService;

    // @GetMapping
    // public ResponseEntity<List<JobCandProgress>> getAllProgresses() {
    //     return ResponseEntity.ok(jobCandProgressService.getAllProgresses());
    // }

    // URL 예시: /api/post/1
    @GetMapping("/stage2y/{postId}")
    public List<ResponderDto> getCandidatesAtStage2yByPost(@PathVariable Long postId) {
        System.out.println("2y 스테이지 후보자 조회 API 호출: " + postId);
        List<ResponderDto> list = jobCandProgressService.getCandidatesAtStage2yByPost(postId);
        System.out.println("API 응답 후보자 수: " + list.size());
        return list;
    }

    // 직접 지원자 상태 일괄 업데이트 API
    @PutMapping("/update-stage")
    public ResponseEntity<Map<String, Object>> updateCandidateStage(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<Integer> candidateIds = (List<Integer>) request.get("candidateIds");
            String newStage = (String) request.get("newStage");
            Long postId = Long.valueOf(request.get("postId").toString());
            
            int updatedCount = jobCandProgressService.updateCandidateStage(candidateIds, newStage, postId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "상태가 성공적으로 업데이트되었습니다.",
                "updatedCount", updatedCount
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "상태 업데이트 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }

    // 여러 공고의 직접 지원자 상태 일괄 업데이트 API
    @PutMapping("/update-stage-multiple")
    public ResponseEntity<Map<String, Object>> updateCandidateStageMultiple(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> candidateData = (List<Map<String, Object>>) request.get("candidateData");
            String newStage = (String) request.get("newStage");
            
            int updatedCount = jobCandProgressService.updateCandidateStageMultiplePosts(candidateData, newStage);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "상태가 성공적으로 업데이트되었습니다.",
                "updatedCount", updatedCount
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "상태 업데이트 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }
}

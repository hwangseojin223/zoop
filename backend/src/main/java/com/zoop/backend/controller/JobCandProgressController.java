package com.zoop.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zoop.backend.domain.dto.JobCandProgressWithCandidateDto;
import com.zoop.backend.domain.dto.ResponderDto;
import com.zoop.backend.domain.entity.JobCandProgress;
import com.zoop.backend.service.JobCandProgressService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
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

    @GetMapping("/job-cand-progress/{jobCandidateId}")
    public ResponseEntity<JobCandProgress> getJobCandProgress(@PathVariable Long jobCandidateId) {
        try {
            Optional<JobCandProgress> progressOpt = jobCandProgressService.getJobCandProgressById(jobCandidateId);
            if (progressOpt.isPresent()) {
                return ResponseEntity.ok(progressOpt.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/job-cand-progress/{jobCandidateId}/with-candidate")
    public ResponseEntity<JobCandProgressWithCandidateDto> getJobCandProgressWithCandidate(@PathVariable Long jobCandidateId) {
        try {
            Optional<JobCandProgressWithCandidateDto> progressOpt = jobCandProgressService.getJobCandProgressWithCandidateById(jobCandidateId);
            if (progressOpt.isPresent()) {
                return ResponseEntity.ok(progressOpt.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/responder/{jobCandidateId}/interview-analysis")
    public ResponseEntity<?> updateInterviewAnalysisId(
            @PathVariable Long jobCandidateId,
            @RequestBody Map<String, Object> request) {
        try {
            Long analysisId = Long.valueOf(request.get("aiInterviewAnalysisId").toString());
            JobCandProgress updated = jobCandProgressService.updateInterviewAnalysisId(jobCandidateId, analysisId);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("업데이트 실패: " + e.getMessage());
        }
    }

    @GetMapping("/job-cand-progress/by-github-login/{githubLogin}")
    public ResponseEntity<JobCandProgress> getJobCandProgressByGithubLogin(@PathVariable String githubLogin) {
        try {
            Optional<JobCandProgress> progressOpt = jobCandProgressService.getJobCandProgressByGithubLogin(githubLogin);
            if (progressOpt.isPresent()) {
                return ResponseEntity.ok(progressOpt.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}

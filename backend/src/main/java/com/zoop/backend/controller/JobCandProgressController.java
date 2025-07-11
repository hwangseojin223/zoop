package com.zoop.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zoop.backend.domain.dto.InvitationSendRequest;
import com.zoop.backend.domain.dto.JobCandidateIdResponse;
import com.zoop.backend.domain.dto.JobCandProgressWithCandidateDto;
import com.zoop.backend.domain.dto.ResponderDto;
import com.zoop.backend.domain.dto.UpdateJobCandProgressRequest;
import com.zoop.backend.domain.entity.JobCandProgress;
import com.zoop.backend.service.JobCandProgressService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class JobCandProgressController {

    private final JobCandProgressService jobCandProgressService;

    // URL 예시: /api/progress/stage2y/1
    @GetMapping("/stage2y/{postId}")
    public List<ResponderDto> getCandidatesAtStage2yByPost(@PathVariable Long postId) {
        log.info("2y 스테이지 후보자 조회 API 호출: " + postId);
        List<ResponderDto> list = jobCandProgressService.getCandidatesAtStage2yByPost(postId);
        log.info("API 응답 후보자 수: " + list.size());
        return list;
    }

    @GetMapping("/{postId}")
    public List<ResponderDto> getCandidatesAtStage3nByPost(@PathVariable Long postId) {
        log.info("Controller: 요청 들어옴, postId=" + postId);
        List<ResponderDto> list = jobCandProgressService.getCandidatesAtStage3nByPost(postId);
        log.info("리스트 크기 : " + list.size());
        return list;
    }

    // 이메일 전송 후 job_cand_curr_stage를 2n으로 업데이트
    @PostMapping("/update-stage-2n")
    public ResponseEntity<?> updateProgressStage(@RequestBody List<InvitationSendRequest> dtos) {
        jobCandProgressService.updateProgressStageBulk(dtos);
        log.info("Controller : 전달받은 데이터: {} ", dtos);
        log.info("Controller: Service로 전달 완료");
        return ResponseEntity.ok("진행 단계가 '2n'으로 업데이트되었습니다.");
    }

    // postId와 githubLogin으로 jobCandidateId 조회
    @GetMapping("/{postId}/{githubLogin}/job-candidate-id")
    public ResponseEntity<?> getJobCandidateId(@PathVariable Long postId, @PathVariable String githubLogin) {
        log.info("jobCandidateId 조회 API 호출: postId={}, githubLogin={}", postId, githubLogin);
        try {
            Long jobCandidateId = jobCandProgressService.getJobCandidateIdByPostAndGithub(postId, githubLogin);
            return ResponseEntity.ok(new JobCandidateIdResponse(jobCandidateId));
        } catch (Exception e) {
            log.error("jobCandidateId 조회 실패: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // invitation token으로 job_cand_progress의 candidate_id 업데이트
    @PostMapping("/update-candidate-id")
    public ResponseEntity<?> updateCandidateId(@RequestBody UpdateJobCandProgressRequest request) {
        log.info("job_cand_progress candidate_id 업데이트 API 호출: {}", request);
        try {
            jobCandProgressService.updateCandidateId(request.getInvitationToken(), request.getCandidateId());
            return ResponseEntity.ok("job_cand_progress의 candidate_id가 성공적으로 업데이트되었습니다.");
        } catch (Exception e) {
            log.error("job_cand_progress candidate_id 업데이트 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("업데이트 실패: " + e.getMessage());
        }
    }

    // jobCandidateId로 stage를 2p로 업데이트 (면접 초대)
    @PostMapping("/{jobCandidateId}/update-stage-2p")
    public ResponseEntity<?> updateStageTo2p(@PathVariable Long jobCandidateId) {
        log.info("stage를 2p로 업데이트 API 호출: jobCandidateId={}", jobCandidateId);
        try {
            jobCandProgressService.updateStageTo2p(jobCandidateId);
            return ResponseEntity.ok("진행 단계가 '2p'로 업데이트되었습니다.");
        } catch (Exception e) {
            log.error("stage 2p 업데이트 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("업데이트 실패: " + e.getMessage());
        }
    }

    // jobCandidateId로 JobCandProgress 조회
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

    // jobCandidateId로 JobCandProgress와 Candidate 정보 함께 조회
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

    // 면접 분석 ID 업데이트
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

    // GitHub 로그인으로 JobCandProgress 조회
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

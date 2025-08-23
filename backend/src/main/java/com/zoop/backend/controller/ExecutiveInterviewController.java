package com.zoop.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PatchMapping;

import com.zoop.backend.domain.dto.ExecutiveInterviewAnalysisDto;
import com.zoop.backend.domain.dto.ExecutiveInterviewCandidateDto;
import com.zoop.backend.domain.dto.ExecutiveInterviewResultDto;
import com.zoop.backend.domain.dto.ExecutiveInterviewScheduleDto;
import com.zoop.backend.domain.entity.AiAnalysisResult;
import com.zoop.backend.domain.entity.ExecutiveInterviewResult;
import com.zoop.backend.domain.entity.ExecutiveInterviewSchedule;
import com.zoop.backend.domain.entity.JobCandProgress;
import com.zoop.backend.service.ExecutiveInterviewService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/executive-interview")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@Slf4j
public class ExecutiveInterviewController {
    
    private final ExecutiveInterviewService executiveInterviewService;
    
    /**
     * 4y 상태 지원자 목록 조회 (AI 면접 패스)
     */
    @GetMapping("/candidates")
    public ResponseEntity<List<ExecutiveInterviewCandidateDto>> get4yCandidates(@RequestParam Long companyId) {
        log.info("4y 상태 지원자 목록 조회: companyId={}", companyId);
        
        try {
            List<ExecutiveInterviewCandidateDto> candidates = executiveInterviewService.get4yCandidates(companyId);
            return ResponseEntity.ok(candidates);
        } catch (Exception e) {
            log.error("4y 상태 지원자 조회 실패: companyId={}, error={}", companyId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 임원 면접 일정 생성
     */
    @PostMapping("/schedule")
    public ResponseEntity<?> createSchedule(@RequestBody ExecutiveInterviewScheduleDto dto) {
        log.info("임원 면접 일정 생성 요청: {}", dto);
        
        try {
            ExecutiveInterviewSchedule schedule = executiveInterviewService.createSchedule(dto);
            log.info("임원 면접 일정 생성 성공: {}", schedule);
            return ResponseEntity.ok(schedule);
        } catch (IllegalArgumentException e) {
            log.warn("잘못된 요청 데이터: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "잘못된 요청 데이터", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("임원 면접 일정 생성 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "서버 내부 오류", "message", e.getMessage()));
        }
    }
    
    /**
     * 임원 면접 AI 분석 결과 저장
     */
    @PostMapping("/analysis")
    public ResponseEntity<AiAnalysisResult> saveAnalysis(@RequestBody ExecutiveInterviewAnalysisDto dto) {
        log.info("임원 면접 AI 분석 결과 저장: jobCandidateId={}", dto.getJobCandidateId());
        
        try {
            AiAnalysisResult result = executiveInterviewService.saveExecutiveInterviewAnalysis(dto);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("임원 면접 AI 분석 결과 저장 실패: jobCandidateId={}, error={}", dto.getJobCandidateId(), e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 임원 면접 결과 저장 (수동 평가)
     */
    @PostMapping("/result")
    public ResponseEntity<ExecutiveInterviewResult> saveResult(@RequestBody ExecutiveInterviewResultDto dto) {
        log.info("임원 면접 수동 결과 저장: scheduleId={}", dto.getScheduleId());
        
        try {
            ExecutiveInterviewResult result = executiveInterviewService.saveManualResult(dto);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("임원 면접 수동 결과 저장 실패: scheduleId={}, error={}", dto.getScheduleId(), e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 공고별 임원 면접 일정 목록 조회
     */
    @GetMapping("/schedules")
    public ResponseEntity<List<ExecutiveInterviewSchedule>> getSchedules(
            @RequestParam(required = false) Long postId,
            @RequestParam(required = false) String status) {
        
        if (postId != null) {
            log.info("공고별 임원 면접 일정 목록 조회: postId={}", postId);
            try {
                List<ExecutiveInterviewSchedule> schedules = executiveInterviewService.getSchedulesByPostId(postId);
                return ResponseEntity.ok(schedules);
            } catch (Exception e) {
                log.error("공고별 임원 면접 일정 조회 실패: postId={}, error={}", postId, e.getMessage());
                return ResponseEntity.internalServerError().build();
            }
        } else if (status != null) {
            log.info("상태별 임원 면접 일정 목록 조회: status={}", status);
            try {
                List<ExecutiveInterviewSchedule> schedules = executiveInterviewService.getSchedulesByStatus(status);
                return ResponseEntity.ok(schedules);
            } catch (Exception e) {
                log.error("상태별 임원 면접 일정 조회 실패: status={}, error={}", status, e.getMessage());
                return ResponseEntity.internalServerError().build();
            }
        } else {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    /**
     * 지원자별 임원 면접 일정 조회
     */
    @GetMapping("/schedule/{jobCandidateId}")
    public ResponseEntity<List<ExecutiveInterviewSchedule>> getScheduleByCandidate(@PathVariable Long jobCandidateId) {
        log.info("지원자별 임원 면접 일정 조회: jobCandidateId={}", jobCandidateId);
        
        try {
            List<ExecutiveInterviewSchedule> schedules = executiveInterviewService.getScheduleByJobCandidateId(jobCandidateId);
            if (!schedules.isEmpty()) {
                return ResponseEntity.ok(schedules);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("지원자별 임원 면접 일정 조회 실패: jobCandidateId={}, error={}", jobCandidateId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 지원자별 임원 면접 AI 분석 결과 조회
     */
    @GetMapping("/analysis/{jobCandidateId}")
    public ResponseEntity<AiAnalysisResult> getAnalysis(@PathVariable Long jobCandidateId) {
        log.info("지원자별 임원 면접 AI 분석 결과 조회: jobCandidateId={}", jobCandidateId);
        
        try {
            Optional<AiAnalysisResult> analysis = executiveInterviewService.getExecutiveInterviewAnalysis(jobCandidateId);
            return analysis.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("지원자별 임원 면접 AI 분석 결과 조회 실패: jobCandidateId={}, error={}", jobCandidateId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 면접 일정별 결과 조회
     */
    @GetMapping("/result/{scheduleId}")
    public ResponseEntity<ExecutiveInterviewResult> getResult(@PathVariable Long scheduleId) {
        log.info("면접 일정별 결과 조회: scheduleId={}", scheduleId);
        
        try {
            Optional<ExecutiveInterviewResult> result = executiveInterviewService.getResultByScheduleId(scheduleId);
            return result.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("면접 일정별 결과 조회 실패: scheduleId={}, error={}", scheduleId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 면접 녹화 파일 업로드 (S3 중계) - 기존 메서드 제거
     */
    // @PostMapping("/upload-recording")
    // public ResponseEntity<?> uploadInterviewRecording(
    //         @RequestParam("file") MultipartFile file,
    //         @RequestParam("candidate_id") String candidateId,
    //         @RequestParam("post_id") String postId,
    //         @RequestParam("interview_type") String interviewType) {
    //     // 이 메서드는 더 이상 사용하지 않음
    // }
    
    /**
     * S3 업로드 완료 후 결과 저장
     */
    @PostMapping("/save-recording-result")
    public ResponseEntity<?> saveRecordingResult(@RequestBody Map<String, Object> request) {
        try {
            log.info("면접 녹화 결과 저장 요청: {}", request);

            String candidateId = (String) request.get("candidate_id");
            String postId = (String) request.get("post_id");
            String interviewType = (String) request.get("interview_type");
            String s3Key = (String) request.get("s3_key");
            String s3Url = (String) request.get("s3_url");
            String fileName = (String) request.get("filename");
            Long fileSize = Long.parseLong(request.get("file_size").toString());
            String contentType = (String) request.get("content_type");
            Integer recordingDuration = request.get("recording_duration") != null ?
                Integer.parseInt(request.get("recording_duration").toString()) : null;
            Long companyAdminId = request.get("company_admin_id") != null ?
                Long.parseLong(request.get("company_admin_id").toString()) : null;

            // executive_interview_schedules 테이블의 notes에 S3 URL 저장
            String result = executiveInterviewService.saveRecordingResultToSchedule(
                candidateId, postId, interviewType, s3Key, s3Url, fileName,
                fileSize, contentType, recordingDuration, companyAdminId
            );

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "면접 녹화 결과가 성공적으로 저장되었습니다.",
                "s3Url", s3Url,
                "notes", result
            ));

        } catch (Exception e) {
            log.error("면접 녹화 결과 저장 실패: error={}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * AI 분석 결과 저장
     */
    @PostMapping("/save-analysis-result")
    public ResponseEntity<?> saveAnalysisResult(@RequestBody Map<String, Object> request) {
        try {
            log.info("AI 분석 결과 저장 요청: {}", request);

            String scheduleId = (String) request.get("schedule_id");
            String analysisType = (String) request.get("analysis_type");
            String transcriptionText = (String) request.get("transcription_text");
            List<Map<String, Object>> transcriptionSegments = (List<Map<String, Object>>) request.get("transcription_segments");
            List<Map<String, Object>> speakerDiarization = (List<Map<String, Object>>) request.get("speaker_diarization");
            String s3Key = (String) request.get("s3_key");
            String language = (String) request.get("language");
            String analysisStatus = (String) request.get("analysis_status");

            // AI 분석 결과를 ai_analysis_results 테이블에 저장
            String result = executiveInterviewService.saveAnalysisResult(
                scheduleId, analysisType, transcriptionText, transcriptionSegments,
                speakerDiarization, s3Key, language, analysisStatus
            );

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "AI 분석 결과가 성공적으로 저장되었습니다.",
                "result", result
            ));

        } catch (Exception e) {
            log.error("AI 분석 결과 저장 실패: error={}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * AI 분석 결과 조회
     */
    @GetMapping("/analysis/{scheduleId}")
    public ResponseEntity<?> getAnalysisResult(@PathVariable String scheduleId) {
        try {
            log.info("AI 분석 결과 조회: scheduleId={}", scheduleId);
            
            Map<String, Object> result = executiveInterviewService.getAnalysisResult(Long.parseLong(scheduleId));
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("AI 분석 결과 조회 실패: error={}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * 면접 평가 및 합불 판정 저장
     */
    @PostMapping("/evaluation/{scheduleId}")
    public ResponseEntity<?> saveEvaluation(
            @PathVariable String scheduleId,
            @RequestBody Map<String, Object> evaluation) {
        try {
            log.info("면접 평가 저장: scheduleId={}, evaluation={}", scheduleId, evaluation);
            
            String result = executiveInterviewService.saveEvaluation(
                Long.parseLong(scheduleId), evaluation);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "면접 평가가 성공적으로 저장되었습니다.",
                "result", result
            ));
            
        } catch (Exception e) {
            log.error("면접 평가 저장 실패: error={}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * 특정 공고의 특정 상태인 임원면접 일정 조회
     */
    @GetMapping("/schedules/post/{postId}/status/{status}")
    public ResponseEntity<List<ExecutiveInterviewSchedule>> getSchedulesByPostIdAndStatus(
            @PathVariable Long postId, @PathVariable String status) {
        log.info("공고 및 상태별 임원면접 일정 조회 요청: postId={}, status={}", postId, status);
        
        try {
            List<ExecutiveInterviewSchedule> schedules = executiveInterviewService.getSchedulesByPostIdAndStatus(postId, status);
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            log.error("공고 및 상태별 임원면접 일정 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 면접 일정 상태 업데이트
     */
    @PatchMapping("/schedules/{scheduleId}/status")
    public ResponseEntity<?> updateScheduleStatus(
            @PathVariable String scheduleId,
            @RequestBody Map<String, String> request) {
        try {
            String newStatus = request.get("status");
            log.info("면접 일정 상태 업데이트: scheduleId={}, newStatus={}", scheduleId, newStatus);

            ExecutiveInterviewSchedule updatedSchedule = executiveInterviewService
                .updateScheduleStatus(Long.parseLong(scheduleId), newStatus);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "면접 일정 상태가 성공적으로 업데이트되었습니다.",
                "scheduleId", scheduleId,
                "status", updatedSchedule.getStatus()
            ));

        } catch (Exception e) {
            log.error("면접 일정 상태 업데이트 실패: error={}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
} 
package com.zoop.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.HashMap;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.zoop.backend.domain.dto.ExecutiveInterviewAnalysisDto;
import com.zoop.backend.domain.dto.ExecutiveInterviewCandidateDto;
import com.zoop.backend.domain.dto.ExecutiveInterviewResultDto;
import com.zoop.backend.domain.dto.ExecutiveInterviewScheduleDto;
import com.zoop.backend.domain.entity.AiAnalysisResult;
import com.zoop.backend.domain.entity.ExecutiveInterviewResult;
import com.zoop.backend.domain.entity.ExecutiveInterviewSchedule;
import com.zoop.backend.domain.entity.JobCandProgress;
import com.zoop.backend.domain.entity.Post;
import com.zoop.backend.repository.AiAnalysisResultRepository;
import com.zoop.backend.repository.ExecutiveInterviewResultRepository;
import com.zoop.backend.repository.ExecutiveInterviewScheduleRepository;
import com.zoop.backend.repository.JobCandProgressRepository;
import com.zoop.backend.repository.PostRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ExecutiveInterviewService {
    
    private final ExecutiveInterviewScheduleRepository scheduleRepository;
    private final ExecutiveInterviewResultRepository resultRepository;
    private final JobCandProgressRepository jobCandProgressRepository;
    private final AiAnalysisResultRepository aiAnalysisResultRepository;
    private final PostRepository postRepository;
    private final S3Service s3Service;
    
    /**
     * 4y 상태 지원자 조회 (AI 면접 패스)
     */
    public List<ExecutiveInterviewCandidateDto> get4yCandidates(Long companyId) {
        log.info("4y 상태 지원자 조회 시작: companyId={}", companyId);
        
        // 해당 회사가 등록한 공고의 4y 상태 지원자 조회
        List<Post> companyPosts = postRepository.findByCompanyId(companyId);
        
        List<JobCandProgress> candidates = companyPosts.stream()
                .flatMap(post -> jobCandProgressRepository.findByPost_PostIdAndJobCandCurrStage(post.getPostId(), "4y").stream())
                .collect(Collectors.toList());
        
        // DTO로 변환하여 scheduleId 포함
        return candidates.stream().map(candidate -> {
            ExecutiveInterviewCandidateDto dto = ExecutiveInterviewCandidateDto.builder()
                .jobCandidateId(candidate.getJobCandidateId())
                .postId(candidate.getPost().getPostId())
                .jobCandCurrStage(candidate.getJobCandCurrStage())
                .candidateEmail(candidate.getCandidate().getCandidateEmail())
                .githubLogin(candidate.getGithubLogin())
                .postTitle(candidate.getPost().getPostTitle())
                .build();
            
            // executive_interview_schedules에서 scheduleId 조회
            try {
                Optional<ExecutiveInterviewSchedule> schedule = scheduleRepository
                    .findByJobCandidateIdAndPostId(candidate.getJobCandidateId(), candidate.getPost().getPostId());
                
                if (schedule.isPresent()) {
                    dto.setScheduleId(schedule.get().getScheduleId());
                    dto.setInterviewStatus(schedule.get().getStatus());
                    dto.setInterviewDate(schedule.get().getInterviewDate());
                    dto.setTimeSlot(schedule.get().getTimeSlot());
                }
            } catch (Exception e) {
                log.warn("지원자 {}의 일정 조회 실패: {}", candidate.getJobCandidateId(), e.getMessage());
            }
            
            return dto;
        }).collect(Collectors.toList());
    }
    
    /**
     * 임원 면접 일정 생성
     */
    public ExecutiveInterviewSchedule createSchedule(ExecutiveInterviewScheduleDto dto) {
        log.info("임원 면접 일정 생성 시작: {}", dto);
        
        try {
            // 입력 데이터 검증
            if (dto.getJobCandidateId() == null) {
                throw new IllegalArgumentException("jobCandidateId는 필수입니다.");
            }
            if (dto.getPostId() == null) {
                throw new IllegalArgumentException("postId는 필수입니다.");
            }
            if (dto.getCompanyAdminId() == null) {
                throw new IllegalArgumentException("companyAdminId는 필수입니다.");
            }
            if (dto.getInterviewDate() == null) {
                throw new IllegalArgumentException("interviewDate는 필수입니다.");
            }
            if (dto.getTimeSlot() == null || dto.getTimeSlot().trim().isEmpty()) {
                throw new IllegalArgumentException("timeSlot는 필수입니다.");
            }
            
            log.info("입력 데이터 검증 완료, 엔티티 생성 시작");
            
            ExecutiveInterviewSchedule schedule = ExecutiveInterviewSchedule.builder()
                    .jobCandidateId(dto.getJobCandidateId())
                    .postId(dto.getPostId())
                    .companyAdminId(dto.getCompanyAdminId())
                    .interviewDate(dto.getInterviewDate())
                    .timeSlot(dto.getTimeSlot())
                    .status("SCHEDULED")
                    .notes(dto.getNotes())
                    .createdAt(LocalDateTime.now())
                    .build();
            
            log.info("엔티티 생성 완료: {}", schedule);
            
            ExecutiveInterviewSchedule savedSchedule = scheduleRepository.save(schedule);
            log.info("데이터베이스 저장 완료: {}", savedSchedule);
            
            return savedSchedule;
        } catch (Exception e) {
            log.error("임원 면접 일정 생성 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("임원 면접 일정 생성에 실패했습니다: " + e.getMessage(), e);
        }
    }
    
    /**
     * 임원 면접 AI 분석 결과 저장 (ai_analysis_results 테이블에)
     */
    public AiAnalysisResult saveExecutiveInterviewAnalysis(ExecutiveInterviewAnalysisDto dto) {
        log.info("임원 면접 AI 분석 결과 저장: {}", dto.getJobCandidateId());
        
        AiAnalysisResult analysisResult = AiAnalysisResult.builder()
                .analysisType("executive_interview")
                .jobCandidateId(dto.getJobCandidateId())
                .analysisData(dto.getAnalysisData())
                .analysisScore(dto.getAnalysisScore())
                .analysisDate(LocalDateTime.now())
                .analysisCreatedAt(LocalDateTime.now())
                .build();
        
        return aiAnalysisResultRepository.save(analysisResult);
    }
    
    /**
     * 임원 면접 결과 저장 (수동 평가)
     */
    public ExecutiveInterviewResult saveManualResult(ExecutiveInterviewResultDto dto) {
        log.info("임원 면접 수동 결과 저장: {}", dto.getScheduleId());
        
        ExecutiveInterviewResult result = ExecutiveInterviewResult.builder()
                .scheduleId(dto.getScheduleId())
                .evaluationScore(dto.getEvaluationScore())
                .evaluationNotes(dto.getEvaluationNotes())
                .finalDecision(dto.getFinalDecision())
                .createdAt(LocalDateTime.now())
                .build();
        
        return resultRepository.save(result);
    }
    
    /**
     * 공고별 임원 면접 일정 조회
     */
    @Transactional(readOnly = true)
    public List<ExecutiveInterviewSchedule> getSchedulesByPostId(Long postId) {
        return scheduleRepository.findByPostIdOrderByInterviewDateAsc(postId);
    }
    
    /**
     * 상태별 임원 면접 일정 조회
     */
    @Transactional(readOnly = true)
    public List<ExecutiveInterviewSchedule> getSchedulesByStatus(String status) {
        log.info("상태별 임원면접 일정 조회: status={}", status);
        
        List<ExecutiveInterviewSchedule> schedules = scheduleRepository.findByStatusOrderByInterviewDateAsc(status);
        
        return schedules;
    }
    
    /**
     * 특정 지원자의 임원면접 일정 조회
     */
    @Transactional(readOnly = true)
    public List<ExecutiveInterviewSchedule> getScheduleByJobCandidateId(Long jobCandidateId) {
        return scheduleRepository.findByJobCandidateId(jobCandidateId);
    }
    
    /**
     * 특정 공고의 특정 상태인 임원면접 일정 조회
     */
    @Transactional(readOnly = true)
    public List<ExecutiveInterviewSchedule> getSchedulesByPostIdAndStatus(Long postId, String status) {
        log.info("공고 및 상태별 임원면접 일정 조회: postId={}, status={}", postId, status);
        
        List<ExecutiveInterviewSchedule> schedules = scheduleRepository
                .findByPostIdAndStatusOrderByInterviewDateAsc(postId, status);
        
        return schedules;
    }
    
    /**
     * 임원면접 일정 상태 업데이트
     */
    @Transactional
    public ExecutiveInterviewSchedule updateScheduleStatus(Long scheduleId, String newStatus) {
        log.info("임원면접 일정 상태 업데이트: scheduleId={}, newStatus={}", scheduleId, newStatus);
        
        ExecutiveInterviewSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 일정입니다."));
        
        schedule.setStatus(newStatus);
        ExecutiveInterviewSchedule updatedSchedule = scheduleRepository.save(schedule);
        
        log.info("임원면접 일정 상태 업데이트 완료: scheduleId={}, status={}", 
                updatedSchedule.getScheduleId(), updatedSchedule.getStatus());
        
        return updatedSchedule;
    }
    
    /**
     * 면접 완료 시 job_cand_progress 상태를 5y로 변경
     */
    @Transactional
    public void updateJobCandProgressTo5y(Long scheduleId) {
        try {
            log.info("면접 완료 시 job_cand_progress 상태 변경: scheduleId={}", scheduleId);
            
            // 면접 일정 조회
            ExecutiveInterviewSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 면접 일정입니다: " + scheduleId));
            
            // job_cand_progress 테이블에서 해당 지원자의 상태를 5y로 변경
            // 이 부분은 JobCandProgressService와 연동해야 합니다
            log.info("지원자 {}의 job_cand_progress 상태를 5y로 변경 예정", schedule.getJobCandidateId());
            
        } catch (Exception e) {
            log.error("job_cand_progress 상태 변경 실패: scheduleId={}, error={}", scheduleId, e.getMessage());
            throw new RuntimeException("job_cand_progress 상태 변경 실패", e);
        }
    }

    /**
     * 면접 일정별 결과 조회
     */
    @Transactional(readOnly = true)
    public Optional<ExecutiveInterviewResult> getResultByScheduleId(Long scheduleId) {
        return resultRepository.findByScheduleId(scheduleId);
    }
    
    /**
     * 지원자별 임원 면접 AI 분석 결과 조회
     */
    @Transactional(readOnly = true)
    public Optional<AiAnalysisResult> getExecutiveInterviewAnalysis(Long jobCandidateId) {
        List<AiAnalysisResult> results = aiAnalysisResultRepository.findByJobCandidateIdAndAnalysisType(jobCandidateId, "executive_interview");
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    /**
     * 면접 녹화 파일 업로드 (S3 중계) - 기존 메서드 제거
     */
    // @Transactional
    // public ExecutiveInterviewVideo uploadInterviewRecording(MultipartFile file, String candidateId, String postId, String interviewType, Long companyAdminId, Integer recordingDuration) {
    //     // 이 메서드는 더 이상 사용하지 않음
    // }
    
    /**
     * S3 URL에서 S3 키 추출
     */
    private String extractS3KeyFromUrl(String s3Url) {
        try {
            // https://bucket-name.s3.region.amazonaws.com/key 형식에서 key 부분 추출
            String[] parts = s3Url.split("/");
            if (parts.length > 3) {
                // bucket-name.s3.region.amazonaws.com 이후의 모든 부분을 키로 사용
                return String.join("/", java.util.Arrays.copyOfRange(parts, 3, parts.length));
            }
            return s3Url;
        } catch (Exception e) {
            log.warn("S3 키 추출 실패: {}", s3Url);
            return s3Url;
        }
    }

    /**
     * S3 업로드 완료 후 결과를 executive_interview_schedules 테이블의 notes에 저장
     */
    @Transactional
    public String saveRecordingResultToSchedule(String candidateId, String postId, String interviewType, 
                                             String s3Key, String s3Url, String fileName, 
                                             Long fileSize, String contentType, Integer recordingDuration, 
                                             Long companyAdminId) {
        try {
            log.info("면접 녹화 결과를 schedule notes에 저장: candidateId={}, postId={}, s3Key={}", candidateId, postId, s3Key);
            
            // 해당 지원자와 공고의 최신 면접 일정을 찾기
            List<ExecutiveInterviewSchedule> schedules = scheduleRepository
                .findByJobCandidateIdAndPostIdOrderByInterviewDateDesc(
                    Long.parseLong(candidateId), 
                    Long.parseLong(postId)
                );
            
            if (schedules.isEmpty()) {
                log.warn("해당 지원자와 공고의 면접 일정을 찾을 수 없음: candidateId={}, postId={}", candidateId, postId);
                // 새로운 일정을 생성하거나 기존 notes에 추가
                return createOrUpdateNotes(candidateId, postId, s3Key, s3Url, fileName, fileSize, contentType, recordingDuration);
            }
            
            // 가장 최근 일정의 notes에 S3 URL 정보 추가
            ExecutiveInterviewSchedule latestSchedule = schedules.get(0);
            String currentNotes = latestSchedule.getNotes() != null ? latestSchedule.getNotes() : "";
            
            // JSON 형태로 S3 정보를 notes에 저장
            String s3Info = String.format(
                "{\"recording_url\": \"%s\", \"s3_key\": \"%s\", \"filename\": \"%s\", " +
                "\"file_size\": %d, \"content_type\": \"%s\", \"recording_duration\": %s, " +
                "\"uploaded_at\": \"%s\"}",
                s3Url, s3Key, fileName, fileSize, contentType, 
                recordingDuration != null ? recordingDuration.toString() : "null",
                java.time.LocalDateTime.now()
            );
            
            // 기존 notes와 새로운 S3 정보를 결합
            String updatedNotes = currentNotes.isEmpty() ? s3Info : currentNotes + "\n\n" + s3Info;
            latestSchedule.setNotes(updatedNotes);
            
            // status를 IN_PROGRESS로 변경하여 AI 분석 진행 상태로 설정
            latestSchedule.setStatus("IN_PROGRESS");
            
            scheduleRepository.save(latestSchedule);
            log.info("면접 녹화 결과를 schedule notes에 저장 완료: scheduleId={}, status=PENDING", latestSchedule.getScheduleId());
            
            return updatedNotes;
            
        } catch (Exception e) {
            log.error("면접 녹화 결과를 schedule notes에 저장 실패: candidateId={}, error={}", candidateId, e.getMessage());
            throw new RuntimeException("면접 녹화 결과를 schedule notes에 저장 실패", e);
        }
    }
    
    /**
     * 공고별 임원면접 관련 지원자 목록 조회 (5n, 5y, 6n, 6y 단계)
     */
    public List<Map<String, Object>> getScheduledCandidatesByPost(Long postId) {
        log.info("공고별 임원면접 관련 지원자 목록 조회 시작: postId={}", postId);
        
        try {
            // 5n, 5y, 6n, 6y 단계의 모든 지원자들 조회
            List<JobCandProgress> candidates = jobCandProgressRepository
                .findByPost_PostIdAndJobCandCurrStageIn(postId, List.of("5n", "5y", "6n", "6y"));
            
            List<Map<String, Object>> result = new java.util.ArrayList<>();
            
            for (JobCandProgress candidate : candidates) {
                try {
                    // 임원면접 일정 정보 조회
                    Optional<ExecutiveInterviewSchedule> schedule = scheduleRepository
                        .findByJobCandidateIdAndPostId(candidate.getJobCandidateId(), postId);
                    
                    Map<String, Object> candidateInfo = new java.util.HashMap<>();
                    candidateInfo.put("jobCandidateId", candidate.getJobCandidateId());
                    candidateInfo.put("postId", postId);
                    candidateInfo.put("jobCandCurrStage", candidate.getJobCandCurrStage());
                    candidateInfo.put("candidateId", candidate.getCandidate().getCandidateId());
                    candidateInfo.put("candidateName", candidate.getCandidate().getCandidateName());
                    candidateInfo.put("candidateEmail", candidate.getCandidate().getCandidateEmail());
                    candidateInfo.put("githubLogin", candidate.getGithubLogin());
                    candidateInfo.put("postTitle", candidate.getPost().getPostTitle());
                    
                    // 일정이 있는 경우에만 일정 정보 추가
                    if (schedule.isPresent()) {
                        ExecutiveInterviewSchedule interviewSchedule = schedule.get();
                        candidateInfo.put("interviewDate", interviewSchedule.getInterviewDate());
                        candidateInfo.put("timeSlot", interviewSchedule.getTimeSlot());
                        candidateInfo.put("status", interviewSchedule.getStatus());
                    } else {
                        // 일정이 없는 경우 기본값 설정
                        candidateInfo.put("interviewDate", null);
                        candidateInfo.put("timeSlot", null);
                        candidateInfo.put("status", null);
                    }
                    
                    result.add(candidateInfo);
                } catch (Exception e) {
                    log.warn("지원자 {}의 임원면접 정보 조회 실패: {}", candidate.getJobCandidateId(), e.getMessage());
                }
            }
            
            log.info("공고별 임원면접 관련 지원자 조회 완료: postId={}, count={}", postId, result.size());
            return result;
            
        } catch (Exception e) {
            log.error("공고별 임원면접 관련 지원자 조회 실패: postId={}, error={}", postId, e.getMessage());
            throw new RuntimeException("공고별 임원면접 관련 지원자 조회 실패", e);
        }
    }

    /**
     * 기존 일정이 없을 경우 새로운 notes 생성 또는 기존 notes 업데이트
     */
    private String createOrUpdateNotes(String candidateId, String postId, String s3Key, String s3Url, 
                                     String fileName, Long fileSize, String contentType, Integer recordingDuration) {
        try {
            // 기존 notes가 있는지 확인 (다른 방법으로 찾기)
            List<ExecutiveInterviewSchedule> allSchedules = scheduleRepository
                .findByJobCandidateId(Long.parseLong(candidateId));
            
            if (!allSchedules.isEmpty()) {
                // 해당 지원자의 다른 일정에 notes 추가
                ExecutiveInterviewSchedule schedule = allSchedules.get(0);
                String currentNotes = schedule.getNotes() != null ? schedule.getNotes() : "";
                
                String s3Info = String.format(
                    "{\"recording_url\": \"%s\", \"s3_key\": \"%s\", \"filename\": \"%s\", " +
                    "\"file_size\": %d, \"content_type\": \"%s\", \"recording_duration\": %s, " +
                    "\"uploaded_at\": \"%s\"}",
                    s3Url, s3Key, fileName, fileSize, contentType, 
                    recordingDuration != null ? recordingDuration.toString() : "null",
                    java.time.LocalDateTime.now()
                );
                
                String updatedNotes = currentNotes.isEmpty() ? s3Info : currentNotes + "\n\n" + s3Info;
                schedule.setNotes(updatedNotes);
                scheduleRepository.save(schedule);
                
                return updatedNotes;
            }
            
            // 완전히 새로운 경우, 간단한 notes 생성
            return String.format(
                "{\"recording_url\": \"%s\", \"s3_key\": \"%s\", \"filename\": \"%s\", " +
                "\"file_size\": %d, \"content_type\": \"%s\", \"recording_duration\": %s, " +
                "\"uploaded_at\": \"%s\"}",
                s3Url, s3Key, fileName, fileSize, contentType, 
                recordingDuration != null ? recordingDuration.toString() : "null",
                java.time.LocalDateTime.now()
            );
            
        } catch (Exception e) {
            log.error("notes 생성/업데이트 실패: error={}", e.getMessage());
            return String.format("S3 URL: %s, S3 Key: %s", s3Url, s3Key);
        }
    }

    /**
     * AI 분석 결과를 ai_analysis_results 테이블에 저장
     */
    @Transactional
    public String saveAnalysisResult(String scheduleId, String analysisType, String transcriptionText,
                                   List<Map<String, Object>> transcriptionSegments,
                                   List<Map<String, Object>> speakerDiarization,
                                   String s3Key, String language, String analysisStatus) {
        try {
            log.info("AI 분석 결과 저장: scheduleId={}, analysisType={}", scheduleId, analysisType);
            
            // 면접 일정에서 job_candidate_id 조회
            ExecutiveInterviewSchedule schedule = scheduleRepository.findById(Long.parseLong(scheduleId))
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 면접 일정입니다: " + scheduleId));
            
            Long jobCandidateId = schedule.getJobCandidateId();
            log.info("면접 일정 {}에서 job_candidate_id {} 조회됨", scheduleId, jobCandidateId);
            
            // AiAnalysisResult 엔티티 생성
            AiAnalysisResult analysisResult = AiAnalysisResult.builder()
                .jobCandidateId(jobCandidateId) // 올바른 candidate_id 사용
                .analysisType(analysisType)
                .analysisData(createAnalysisResultJson(transcriptionSegments, speakerDiarization))
                .analysisDate(java.time.LocalDateTime.now())
                .analysisCreatedAt(java.time.LocalDateTime.now())
                .build();
            
            // DB에 저장
            AiAnalysisResult savedResult = aiAnalysisResultRepository.save(analysisResult);
            log.info("AI 분석 결과 저장 완료: analysisId={}, jobCandidateId={}", savedResult.getAnalysisId(), jobCandidateId);
            
            return "AI 분석 결과가 성공적으로 저장되었습니다.";
            
        } catch (Exception e) {
            log.error("AI 분석 결과 저장 실패: scheduleId={}, error={}", scheduleId, e.getMessage());
            throw new RuntimeException("AI 분석 결과 저장 실패", e);
        }
    }
    
    /**
     * 분석 결과를 JSON 형태로 생성
     */
    private String createAnalysisResultJson(List<Map<String, Object>> transcriptionSegments,
                                          List<Map<String, Object>> speakerDiarization) {
        try {
            Map<String, Object> result = new HashMap<>();
            result.put("transcription_segments", transcriptionSegments);
            result.put("speaker_diarization", speakerDiarization);
            result.put("analysis_timestamp", java.time.LocalDateTime.now().toString());
            
            return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(result);
        } catch (Exception e) {
            log.error("JSON 생성 실패: {}", e.getMessage());
            return "{}";
        }
    }

    /**
     * AI 분석 결과 조회
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getAnalysisResult(Long scheduleId) {
        try {
            log.info("AI 분석 결과 조회: scheduleId={}", scheduleId);
            
            // 면접 일정 조회
            ExecutiveInterviewSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 면접 일정입니다."));
            
            // AI 분석 결과 조회
            List<AiAnalysisResult> analysisResults = aiAnalysisResultRepository
                .findByJobCandidateIdAndAnalysisType(schedule.getJobCandidateId(), "executive_interview");
            
            if (analysisResults.isEmpty()) {
                throw new IllegalArgumentException("AI 분석 결과를 찾을 수 없습니다.");
            }
            
            AiAnalysisResult result = analysisResults.get(0);
            
            // JSON 파싱
            Map<String, Object> analysisData = parseAnalysisData(result.getAnalysisData());
            
            // 결과 구성
            Map<String, Object> response = new HashMap<>();
            response.put("scheduleId", scheduleId);
            response.put("interviewDate", schedule.getInterviewDate());
            response.put("recordingDuration", extractRecordingDuration(schedule.getNotes()));
            response.put("transcriptionText", result.getAnalysisData());
            response.put("transcriptionSegments", analysisData.get("transcription_segments"));
            response.put("speakerDiarization", analysisData.get("speaker_diarization"));
            response.put("language", "ko"); // 기본값
            
            return response;
            
        } catch (Exception e) {
            log.error("AI 분석 결과 조회 실패: scheduleId={}, error={}", scheduleId, e.getMessage());
            throw new RuntimeException("AI 분석 결과 조회 실패", e);
        }
    }
    
    /**
     * 면접 평가 및 합불 판정 저장
     */
    @Transactional
    public String saveEvaluation(Long scheduleId, Map<String, Object> evaluation) {
        try {
            log.info("면접 평가 저장: scheduleId={}, evaluation={}", scheduleId, evaluation);
            
            // 면접 일정 조회
            ExecutiveInterviewSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 면접 일정입니다."));
            
            // 평가 정보를 notes에 추가
            String currentNotes = schedule.getNotes() != null ? schedule.getNotes() : "";
            
            // 평가 JSON 생성
            String evaluationJson = createEvaluationJson(evaluation);
            
            // 기존 notes와 평가 정보 결합
            String updatedNotes = currentNotes.isEmpty() ? evaluationJson : currentNotes + "\n\n" + evaluationJson;
            schedule.setNotes(updatedNotes);
            
            // 상태 업데이트
            String decision = (String) evaluation.get("decision");
            if ("PASS".equals(decision) || "FAIL".equals(decision)) {
                schedule.setStatus("EVALUATED");
            }
            
            scheduleRepository.save(schedule);
            log.info("면접 평가 저장 완료: scheduleId={}, decision={}", scheduleId, decision);
            
            return "면접 평가가 성공적으로 저장되었습니다.";
            
        } catch (Exception e) {
            log.error("면접 평가 저장 실패: scheduleId={}, error={}", scheduleId, e.getMessage());
            throw new RuntimeException("면접 평가 저장 실패", e);
        }
    }
    
    /**
     * 분석 데이터 JSON 파싱
     */
    private Map<String, Object> parseAnalysisData(String analysisData) {
        try {
            if (analysisData == null || analysisData.trim().isEmpty()) {
                return new HashMap<>();
            }
            
            return new com.fasterxml.jackson.databind.ObjectMapper()
                .readValue(analysisData, Map.class);
                
        } catch (Exception e) {
            log.error("분석 데이터 JSON 파싱 실패: {}", e.getMessage());
            return new HashMap<>();
        }
    }
    
    /**
     * 녹화 시간 추출
     */
    private Integer extractRecordingDuration(String notes) {
        try {
            if (notes == null || notes.trim().isEmpty()) {
                return 0;
            }
            
            // JSON에서 recording_duration 추출
            if (notes.contains("recording_duration")) {
                // 간단한 정규식으로 추출
                java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("recording_duration\":\\s*(\\d+)");
                java.util.regex.Matcher matcher = pattern.matcher(notes);
                if (matcher.find()) {
                    return Integer.parseInt(matcher.group(1));
                }
            }
            
            return 0;
            
        } catch (Exception e) {
            log.error("녹화 시간 추출 실패: {}", e.getMessage());
            return 0;
        }
    }
    
    /**
     * 평가 정보를 JSON 형태로 생성
     */
    private String createEvaluationJson(Map<String, Object> evaluation) {
        try {
            Map<String, Object> result = new HashMap<>();
            result.put("evaluation", evaluation);
            result.put("evaluated_at", java.time.LocalDateTime.now().toString());
            
            return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(result);
        } catch (Exception e) {
            log.error("평가 JSON 생성 실패: {}", e.getMessage());
            return "{}";
        }
    }
} 
package com.zoop.backend.service;

import com.zoop.backend.domain.dto.ExecutiveInterviewResultDto;
import com.zoop.backend.domain.entity.ExecutiveInterviewResult;
import com.zoop.backend.domain.entity.ExecutiveInterviewSchedule;
import com.zoop.backend.domain.entity.AiAnalysisResult;
import com.zoop.backend.repository.ExecutiveInterviewResultRepository;
import com.zoop.backend.repository.ExecutiveInterviewScheduleRepository;
import com.zoop.backend.repository.AiAnalysisResultRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExecutiveInterviewResultService {
    
    private final ExecutiveInterviewResultRepository resultRepository;
    private final ExecutiveInterviewScheduleRepository scheduleRepository;
    private final AiAnalysisResultRepository aiAnalysisResultRepository;
    private final JobCandProgressService jobCandProgressService;
    
    /**
     * 면접 결과 생성 또는 업데이트
     */
    @Transactional
    public ExecutiveInterviewResult saveOrUpdateResult(ExecutiveInterviewResultDto dto) {
        log.info("면접 결과 저장/업데이트: scheduleId={}", dto.getScheduleId());
        
        // 기존 결과가 있는지 확인
        Optional<ExecutiveInterviewResult> existingResult = resultRepository.findByScheduleId(dto.getScheduleId());
        
        ExecutiveInterviewResult result;
        if (existingResult.isPresent()) {
            // 기존 결과 업데이트
            result = existingResult.get();
            result.setEvaluationScore(dto.getEvaluationScore());
            result.setEvaluationNotes(dto.getEvaluationNotes());
            result.setFinalDecision(dto.getFinalDecision());
        } else {
            // 새 결과 생성
            result = ExecutiveInterviewResult.builder()
                .scheduleId(dto.getScheduleId())
                .evaluationScore(dto.getEvaluationScore())
                .evaluationNotes(dto.getEvaluationNotes())
                .finalDecision(dto.getFinalDecision())
                .build();
        }
        
        ExecutiveInterviewResult savedResult = resultRepository.save(result);
        log.info("면접 결과 저장 완료: resultId={}", savedResult.getResultId());
        
        return savedResult;
    }
    
    /**
     * 면접 일정 ID로 결과 조회
     */
    @Transactional(readOnly = true)
    public Optional<ExecutiveInterviewResultDto> getResultByScheduleId(Long scheduleId) {
        log.info("면접 결과 조회: scheduleId={}", scheduleId);
        
        Optional<ExecutiveInterviewResult> result = resultRepository.findByScheduleId(scheduleId);
        if (result.isPresent()) {
            ExecutiveInterviewResultDto dto = convertToDto(result.get());
            return Optional.of(dto);
        }
        
        return Optional.empty();
    }
    
    /**
     * 모든 면접 결과 조회
     */
    @Transactional(readOnly = true)
    public List<ExecutiveInterviewResultDto> getAllResults() {
        log.info("모든 면접 결과 조회");
        
        List<ExecutiveInterviewResult> results = resultRepository.findAll();
        return results.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
    
    /**
     * 최종 결정별 결과 조회
     */
    @Transactional(readOnly = true)
    public List<ExecutiveInterviewResultDto> getResultsByDecision(String decision) {
        log.info("최종 결정별 결과 조회: decision={}", decision);
        
        List<ExecutiveInterviewResult> results = resultRepository.findByFinalDecision(decision);
        return results.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
    
    /**
     * 최종 합격/불합격 결정
     */
    @Transactional
    public ExecutiveInterviewResult makeFinalDecision(Long scheduleId, String decision, String notes) {
        log.info("최종 결정: scheduleId={}, decision={}", scheduleId, decision);
        
        if (!"PASS".equals(decision) && !"FAIL".equals(decision)) {
            throw new IllegalArgumentException("유효하지 않은 결정입니다: " + decision);
        }
        
        ExecutiveInterviewResult result = resultRepository.findByScheduleId(scheduleId)
            .orElseThrow(() -> new IllegalArgumentException("면접 결과를 찾을 수 없습니다: " + scheduleId));
        
        result.setFinalDecision(decision);
        if (notes != null) {
            result.setEvaluationNotes(notes);
        }
        
        ExecutiveInterviewResult savedResult = resultRepository.save(result);
        log.info("최종 결정 완료: resultId={}, decision={}", savedResult.getResultId(), decision);
        
        // 면접 완료 시 executive_interview_schedules.status를 COMPLETED로 변경
        try {
            updateInterviewScheduleStatus(scheduleId, "COMPLETED");
            log.info("면접 일정 상태를 COMPLETED로 변경 완료: scheduleId={}", scheduleId);
        } catch (Exception e) {
            log.warn("면접 일정 상태 변경 실패: {}", e.getMessage());
        }
        
        // 면접 완료 시 job_cand_progress 상태를 5y로 변경 (임원면접 완료)
        try {
            updateJobCandProgressStatus(scheduleId, "5y");
            log.info("job_cand_progress 상태를 5y(임원면접 완료)로 변경 완료: scheduleId={}", scheduleId);
        } catch (Exception e) {
            log.warn("job_cand_progress 상태 변경 실패: {}", e.getMessage());
        }
        
        // 최종 결정에 따라 job_cand_progress 상태를 6y 또는 6n으로 변경
        try {
            String finalStage = "PASS".equals(decision) ? "6y" : "6n";
            updateJobCandProgressStatus(scheduleId, finalStage);
            log.info("job_cand_progress 상태를 {}(최종 {})로 변경 완료: scheduleId={}", 
                finalStage, "PASS".equals(decision) ? "합격" : "불합격", scheduleId);
        } catch (Exception e) {
            log.warn("최종 결정 상태 변경 실패: {}", e.getMessage());
        }
        
        return savedResult;
    }
    
    /**
     * 면접 일정 상태 업데이트
     */
    private void updateInterviewScheduleStatus(Long scheduleId, String newStatus) {
        try {
            // 면접 일정 상태를 COMPLETED로 변경
            ExecutiveInterviewSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 면접 일정입니다: " + scheduleId));
            
            schedule.setStatus(newStatus);
            scheduleRepository.save(schedule);
            log.info("면접 일정 상태 변경 완료: scheduleId={}, status={}", scheduleId, newStatus);
            
        } catch (Exception e) {
            log.error("면접 일정 상태 변경 실패: scheduleId={}, error={}", scheduleId, e.getMessage());
            throw e;
        }
    }
    
    /**
     * job_cand_progress 상태 업데이트
     */
    private void updateJobCandProgressStatus(Long scheduleId, String newStatus) {
        try {
            // 면접 일정에서 job_candidate_id 조회
            ExecutiveInterviewSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 면접 일정입니다: " + scheduleId));
            
            Long jobCandidateId = schedule.getJobCandidateId();
            
            // job_cand_progress 테이블 업데이트
            log.info("지원자 {}의 job_cand_progress 상태를 {}로 변경", jobCandidateId, newStatus);
            
            // JobCandProgressService를 통해 상태 업데이트
            jobCandProgressService.updateStageWithNotification(jobCandidateId, newStatus);
            log.info("지원자 {}의 job_cand_progress 상태를 {}로 변경 완료", jobCandidateId, newStatus);
            
        } catch (Exception e) {
            log.error("job_cand_progress 상태 업데이트 실패: scheduleId={}, error={}", scheduleId, e.getMessage());
            throw e;
        }
    }
    
    /**
     * 엔티티를 DTO로 변환
     */
    private ExecutiveInterviewResultDto convertToDto(ExecutiveInterviewResult result) {
        ExecutiveInterviewResultDto dto = ExecutiveInterviewResultDto.builder()
            .resultId(result.getResultId())
            .scheduleId(result.getScheduleId())
            .evaluationScore(result.getEvaluationScore())
            .evaluationNotes(result.getEvaluationNotes())
            .finalDecision(result.getFinalDecision())
            .createdAt(result.getCreatedAt())
            .build();
        
        // 추가 정보 설정
        try {
            // 면접 일정 정보 조회
            Optional<ExecutiveInterviewSchedule> schedule = scheduleRepository.findById(result.getScheduleId());
            if (schedule.isPresent()) {
                ExecutiveInterviewSchedule scheduleEntity = schedule.get();
                dto.setInterviewDate(scheduleEntity.getInterviewDate().toString());
                
                // AI 분석 결과 조회
                List<AiAnalysisResult> aiResults = aiAnalysisResultRepository
                    .findByJobCandidateIdAndAnalysisType(scheduleEntity.getJobCandidateId(), "executive_interview");
                if (!aiResults.isEmpty()) {
                    dto.setAiAnalysisResult(aiResults.get(0).getAnalysisData());
                }
            }
        } catch (Exception e) {
            log.warn("추가 정보 조회 실패: {}", e.getMessage());
        }
        
        return dto;
    }
} 
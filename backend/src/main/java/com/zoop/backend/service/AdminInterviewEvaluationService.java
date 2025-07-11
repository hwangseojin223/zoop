package com.zoop.backend.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zoop.backend.domain.dto.AdminInterviewEvaluationDto;
import com.zoop.backend.domain.entity.AdminInterviewEvaluation;
import com.zoop.backend.domain.entity.JobCandProgress;
import com.zoop.backend.repository.AdminInterviewEvaluationRepository;
import com.zoop.backend.repository.JobCandProgressRepository;

@Service
public class AdminInterviewEvaluationService {
    
    private final AdminInterviewEvaluationRepository adminInterviewEvaluationRepository;
    private final JobCandProgressRepository jobCandProgressRepository;
    
    @Autowired
    public AdminInterviewEvaluationService(AdminInterviewEvaluationRepository adminInterviewEvaluationRepository,
                                         JobCandProgressRepository jobCandProgressRepository) {
        this.adminInterviewEvaluationRepository = adminInterviewEvaluationRepository;
        this.jobCandProgressRepository = jobCandProgressRepository;
    }
    
    @Transactional
    public AdminInterviewEvaluationDto saveEvaluation(AdminInterviewEvaluationDto evaluationDto) {
        AdminInterviewEvaluation evaluation = AdminInterviewEvaluation.builder()
                .jobCandidateId(evaluationDto.getJobCandidateId())
                .evaluatedByAdminId(evaluationDto.getEvaluatedByAdminId())
                .adminIntrvwEvaluationDate(evaluationDto.getAdminIntrvwEvaluationDate())
                .adminIntrvwScore(evaluationDto.getAdminIntrvwScore())
                .adminIntrvwNotes(evaluationDto.getAdminIntrvwNotes())
                .adminIntrvwSlctStatus(evaluationDto.getAdminIntrvwSlctStatus())
                .build();
        
        AdminInterviewEvaluation savedEvaluation = adminInterviewEvaluationRepository.save(evaluation);
        
        // JobCandProgress의 stage 업데이트
        Optional<JobCandProgress> progressOpt = jobCandProgressRepository.findById(evaluationDto.getJobCandidateId());
        if (progressOpt.isPresent()) {
            JobCandProgress progress = progressOpt.get();
            String oldStage = progress.getJobCandCurrStage();
            String newStage = "selected".equals(evaluationDto.getAdminIntrvwSlctStatus()) ? "4y" : "4n";
            
            System.out.println("[AdminInterviewEvaluation] Stage 업데이트:");
            System.out.println("  - JobCandidateId: " + evaluationDto.getJobCandidateId());
            System.out.println("  - 기존 Stage: " + oldStage);
            System.out.println("  - 새로운 Stage: " + newStage);
            System.out.println("  - 선정 상태: " + evaluationDto.getAdminIntrvwSlctStatus());
            
            progress.setJobCandCurrStage(newStage);
            progress.setAdminIntrvwEvalId(savedEvaluation.getAdminIntrvwEvalId());
            JobCandProgress savedProgress = jobCandProgressRepository.save(progress);
            
            System.out.println("[AdminInterviewEvaluation] Stage 업데이트 완료: " + savedProgress.getJobCandCurrStage());
        } else {
            System.out.println("[AdminInterviewEvaluation] JobCandProgress를 찾을 수 없음: " + evaluationDto.getJobCandidateId());
        }
        
        return AdminInterviewEvaluationDto.builder()
                .adminIntrvwEvalId(savedEvaluation.getAdminIntrvwEvalId())
                .jobCandidateId(savedEvaluation.getJobCandidateId())
                .evaluatedByAdminId(savedEvaluation.getEvaluatedByAdminId())
                .adminIntrvwEvaluationDate(savedEvaluation.getAdminIntrvwEvaluationDate())
                .adminIntrvwScore(savedEvaluation.getAdminIntrvwScore())
                .adminIntrvwNotes(savedEvaluation.getAdminIntrvwNotes())
                .adminIntrvwSlctStatus(savedEvaluation.getAdminIntrvwSlctStatus())
                .adminIntrvwCreatedAt(savedEvaluation.getAdminIntrvwCreatedAt())
                .build();
    }
    
    @Transactional(readOnly = true)
    public Optional<AdminInterviewEvaluationDto> getEvaluationByJobCandidateId(Long jobCandidateId) {
        return adminInterviewEvaluationRepository.findByJobCandidateId(jobCandidateId)
                .map(evaluation -> AdminInterviewEvaluationDto.builder()
                        .adminIntrvwEvalId(evaluation.getAdminIntrvwEvalId())
                        .jobCandidateId(evaluation.getJobCandidateId())
                        .evaluatedByAdminId(evaluation.getEvaluatedByAdminId())
                        .adminIntrvwEvaluationDate(evaluation.getAdminIntrvwEvaluationDate())
                        .adminIntrvwScore(evaluation.getAdminIntrvwScore())
                        .adminIntrvwNotes(evaluation.getAdminIntrvwNotes())
                        .adminIntrvwSlctStatus(evaluation.getAdminIntrvwSlctStatus())
                        .adminIntrvwCreatedAt(evaluation.getAdminIntrvwCreatedAt())
                        .build());
    }
} 
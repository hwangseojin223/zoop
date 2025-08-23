package com.zoop.backend.service;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zoop.backend.domain.dto.AdminInterviewEvaluationDto;
import com.zoop.backend.domain.entity.AdminInterviewEvaluation;
import com.zoop.backend.domain.entity.Candidate;
import com.zoop.backend.domain.entity.Company;
import com.zoop.backend.domain.entity.JobCandProgress;
import com.zoop.backend.domain.entity.Post;
import com.zoop.backend.repository.AdminInterviewEvaluationRepository;
import com.zoop.backend.repository.CandidateRepository;
import com.zoop.backend.repository.CompanyRepository;
import com.zoop.backend.repository.JobCandProgressRepository;
import com.zoop.backend.repository.PostRepository;

import jakarta.mail.MessagingException;
import lombok.extern.slf4j.Slf4j;

@Slf4j@Service
public class AdminInterviewEvaluationService {
    
    private final AdminInterviewEvaluationRepository adminInterviewEvaluationRepository;
    private final JobCandProgressRepository jobCandProgressRepository;
    private final JobCandProgressService jobCandProgressService;
    private final EmailService emailService;
    private final CandidateRepository candidateRepository;
    private final PostRepository postRepository;
    private final CompanyRepository companyRepository;
    
    @Autowired
    public AdminInterviewEvaluationService(
        AdminInterviewEvaluationRepository adminInterviewEvaluationRepository,
        JobCandProgressRepository jobCandProgressRepository,
        JobCandProgressService jobCandProgressService,
        EmailService emailService,
        CandidateRepository candidateRepository,
        PostRepository postRepository,
        CompanyRepository companyRepository
    ) {
        this.adminInterviewEvaluationRepository = adminInterviewEvaluationRepository;
        this.jobCandProgressRepository = jobCandProgressRepository;
        this.jobCandProgressService = jobCandProgressService;
        this.emailService = emailService;
        this.candidateRepository = candidateRepository;
        this.postRepository = postRepository;
        this.companyRepository = companyRepository;
    }
    
    @Transactional
    public AdminInterviewEvaluationDto saveEvaluation(AdminInterviewEvaluationDto evaluationDto) {
        AdminInterviewEvaluation evaluation = AdminInterviewEvaluation.builder()
                .jobCandidateId(evaluationDto.getJobCandidateId())
                .evaluatedByAdminId(evaluationDto.getEvaluatedByAdminId())
                .adminIntrvwEvaluationDate(evaluationDto.getAdminIntrvwEvaluationDate())
                .adminIntrvwScore(evaluationDto.getAdminIntrvwScore())
                .adminIntrvwNotes(evaluationDto.getAdminIntrvwNotes())
                .build();
        
        AdminInterviewEvaluation savedEvaluation = adminInterviewEvaluationRepository.save(evaluation);
        
        // JobCandProgress의 stage 업데이트는 별도로 처리 (Pass/Fail 버튼에서)
        // 여기서는 평가 데이터만 저장
        
        System.out.println("[AdminInterviewEvaluation] 평가 데이터 저장 완료:");
        System.out.println("  - JobCandidateId: " + evaluationDto.getJobCandidateId());
        System.out.println("  - 점수: " + evaluationDto.getAdminIntrvwScore());
        System.out.println("  - 평가 의견: " + evaluationDto.getAdminIntrvwNotes());
        
        return AdminInterviewEvaluationDto.builder()
                .adminIntrvwEvalId(savedEvaluation.getAdminIntrvwEvalId())
                .jobCandidateId(savedEvaluation.getJobCandidateId())
                .evaluatedByAdminId(savedEvaluation.getEvaluatedByAdminId())
                .adminIntrvwEvaluationDate(savedEvaluation.getAdminIntrvwEvaluationDate())
                .adminIntrvwScore(savedEvaluation.getAdminIntrvwScore())
                .adminIntrvwNotes(savedEvaluation.getAdminIntrvwNotes())
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
                        .adminIntrvwCreatedAt(evaluation.getAdminIntrvwCreatedAt())
                        .build());
    }
    
    /**
     * 합격 안내 메일 발송
     */
    private void sendPassNotificationEmail(JobCandProgress progress) throws MessagingException {
        // 후보자 정보 조회
        Optional<Candidate> candidateOpt = candidateRepository.findById(progress.getCandidate().getCandidateId());
        if (candidateOpt.isEmpty()) {
            System.err.println("[AdminInterviewEvaluation] 후보자 정보를 찾을 수 없음: " + progress.getCandidate().getCandidateId());
            return;
        }
        Candidate candidate = candidateOpt.get();
        
        // 공고 정보 조회
        Optional<Post> postOpt = postRepository.findById(progress.getPost().getPostId());
        if (postOpt.isEmpty()) {
            System.err.println("[AdminInterviewEvaluation] 공고 정보를 찾을 수 없음: " + progress.getPost().getPostId());
            return;
        }
        Post post = postOpt.get();
        
        // 회사명 조회
        String companyName = "기업"; // 기본값
        if (post.getCompany() != null) {
            companyName = post.getCompany().getCompanyName();
        } else if (post.getCompanyId() != null) {
            // Company 엔티티가 로드되지 않은 경우 직접 조회
            try {
                Optional<Company> companyOpt = companyRepository.findById(post.getCompanyId());
                if (companyOpt.isPresent()) {
                    companyName = companyOpt.get().getCompanyName();
                }
            } catch (Exception e) {
                System.err.println("[AdminInterviewEvaluation] 회사 정보 조회 실패: " + e.getMessage());
            }
        }
        
        // 합격 메일 발송
        emailService.sendPassNotificationEmail(
            candidate.getCandidateEmail(),
            candidate.getCandidateName(),
            post.getPostTitle(),
            companyName
        );
        
        System.out.println("[AdminInterviewEvaluation] 합격 메일 발송: " + candidate.getCandidateEmail());
    }
} 
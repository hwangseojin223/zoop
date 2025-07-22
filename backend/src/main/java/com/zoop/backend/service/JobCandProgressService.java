package com.zoop.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zoop.backend.domain.dto.InvitationSendRequest;
import com.zoop.backend.domain.dto.JobCandProgressWithCandidateDto;
import com.zoop.backend.domain.dto.ResponderDto;
import com.zoop.backend.domain.entity.Candidate;
import com.zoop.backend.domain.entity.JobCandProgress;
import com.zoop.backend.domain.entity.Post;
import com.zoop.backend.repository.CandidateRepository;
import com.zoop.backend.repository.InvitationRepository;
import com.zoop.backend.repository.JobCandProgressRepository;
import com.zoop.backend.repository.PostRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class JobCandProgressService {

    private final JobCandProgressRepository jobCandProgressRepository;
    private final InvitationRepository invitationRepository;
    private final CandidateRepository candidateRepository;
    private final PostRepository postRepository;
    private final CandidateNotificationService candidateNotificationService;
    private final CompanyNotificationService companyNotificationService;

    public List<JobCandProgress> getAllJobCandProgress() {
        return jobCandProgressRepository.findAll();
    }

    public Optional<JobCandProgress> getJobCandProgressById(Long jobCandidateId) {
        return jobCandProgressRepository.findById(jobCandidateId);
    }

    public List<JobCandProgress> getJobCandProgressByPostId(Long postId) {
        return jobCandProgressRepository.findByPost_PostId(postId);
    }

    public List<JobCandProgress> getJobCandProgressByCandidateId(Long candidateId) {
        return jobCandProgressRepository.findByCandidate_CandidateId(candidateId.intValue());
    }

    public JobCandProgress saveJobCandProgress(JobCandProgress jobCandProgress) {
        return jobCandProgressRepository.save(jobCandProgress);
    }

    public void deleteJobCandProgress(Long jobCandidateId) {
        jobCandProgressRepository.deleteById(jobCandidateId);
    }

    public JobCandProgress updateJobCandProgress(JobCandProgress jobCandProgress) {
        return jobCandProgressRepository.save(jobCandProgress);
    }

    // 새로운 job_cand_progress 생성 (candidate_portfolios 매칭용)
    public JobCandProgress createJobCandProgress(Long postId, Long candidateId, String stage) {
        // Post와 Candidate 엔티티 조회
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found: " + postId));
        
        Candidate candidate = candidateRepository.findById(candidateId)
            .orElseThrow(() -> new RuntimeException("Candidate not found: " + candidateId));
        
        // 새로운 JobCandProgress 생성
        JobCandProgress newProgress = JobCandProgress.builder()
            .post(post)
            .candidate(candidate)
            .jobCandCurrStage(stage)
            .jobCandCreatedAt(LocalDateTime.now())
            .jobCandUpdatedAt(LocalDateTime.now())
            .githubLogin(candidate.getGithubLogin())
            .build();
        
        JobCandProgress savedProgress = jobCandProgressRepository.save(newProgress);
        
        // 지원 시(0) → 기업에게만 알림
        if ("0".equals(stage)) {
            try {
                companyNotificationService.createAdditionalApplicantNotification(
                    post.getCompanyAdminId(),
                    postId,
                    candidateId
                );
            } catch (Exception e) {
                log.error("추가 지원자 알림 생성 중 오류 발생: {}", e.getMessage(), e);
            }
        }
        // 포트폴리오 직접 제출(2y)는 기존대로(별도 알림)
        return savedProgress;
    }

    // 수락(2p)/거절(0n) 시 개인에게만 알림
    public void acceptOrRejectAdditionalApplicant(Long jobCandidateId, String newStage) {
        var progressOpt = jobCandProgressRepository.findByJobCandidateId(jobCandidateId);
        if (progressOpt.isPresent()) {
            JobCandProgress progress = progressOpt.get();
            String oldStage = progress.getJobCandCurrStage();
            progress.setJobCandCurrStage(newStage);
            progress.setJobCandUpdatedAt(LocalDateTime.now());
            jobCandProgressRepository.save(progress);
            if ("2p".equals(newStage)) {
                candidateNotificationService.createAcceptedNotification(
                    progress.getCandidate().getCandidateId(),
                    progress.getPost().getPostId(),
                    progress.getPost().getCompanyId()
                );
            } else if ("0n".equals(newStage)) {
                candidateNotificationService.createRejectedNotification(
                    progress.getCandidate().getCandidateId(),
                    progress.getPost().getPostId(),
                    progress.getPost().getCompanyId()
                );
            }
        }
    }

    @Transactional(readOnly = true)
    public List<ResponderDto> getCandidatesAtStage2yByPost(Long postId) {
        System.out.println("2y 스테이지 후보자 조회: " + postId);
        List<ResponderDto> list = jobCandProgressRepository.findCandidatesAtStage2yByPost(postId);
        System.out.println("조회된 후보자 수: " + list.size());
        return list;
    }

    @Transactional(readOnly = true)
    public List<ResponderDto> getCandidatesAtStage3nByPost(Long postId) {
        System.out.println("3n 스테이지 후보자 조회: " + postId);
        List<ResponderDto> list = jobCandProgressRepository.findCandidatesAtStage3nByPost(postId);
        System.out.println("조회된 후보자 수: " + list.size());
        return list;
    }

    public void updateProgressStageBulk(List<InvitationSendRequest> dtos) {
        for (InvitationSendRequest dto : dtos) {
            log.info("Service : 전달받은 데이터: {} ", dtos);
            jobCandProgressRepository.updateStageByPostIdAndGithubLogin(
                dto.getPostId(),
                dto.getGithubLogin(),
                "2n"
            );
            log.info("Service: Repository로 전달 완료");
        }
    }

    @Transactional(readOnly = true)
    public Long getJobCandidateIdByPostAndGithub(Long postId, String githubLogin) {
        log.info("jobCandidateId 조회: postId={}, githubLogin={}", postId, githubLogin);
        return jobCandProgressRepository.findByPost_PostIdAndGithubLogin(postId, githubLogin)
            .orElseThrow(() -> new RuntimeException("해당 후보자를 찾을 수 없습니다."))
            .getJobCandidateId();
    }

    @Transactional
    public void updateCandidateId(String invitationToken, Long candidateId) {
        log.info("job_cand_progress candidate_id 업데이트: invitationToken={}, candidateId={}", invitationToken, candidateId);
        
        // invitation에서 post_id와 github_login 가져오기
        var invitation = invitationRepository.findByInvitationUniqueToken(invitationToken);
        if (invitation.isPresent()) {
            Long postId = invitation.get().getPostId();
            String githubLogin = invitation.get().getGithubLogin();
            
            // job_cand_progress에서 해당 레코드 찾아서 candidate_id 업데이트
            int updatedRows = jobCandProgressRepository.updateCandidateIdByPostIdAndGithubLogin(postId, githubLogin, candidateId);
            log.info("업데이트된 행 수: {}", updatedRows);
        } else {
            log.warn("invitation을 찾을 수 없습니다: {}", invitationToken);
        }
    }

    // 면접초대 : stage를 2p로 업데이트
    @Transactional
    public void updateStageTo2p(Long jobCandidateId) {
        log.info("stage를 2p로 업데이트: jobCandidateId={}", jobCandidateId);
        
        var progress = jobCandProgressRepository.findByJobCandidateId(jobCandidateId);
        if (progress.isPresent()) {
            progress.get().setJobCandCurrStage("2p");
            progress.get().setJobCandUpdatedAt(java.time.LocalDateTime.now());
            jobCandProgressRepository.save(progress.get());
            log.info("stage가 2p로 업데이트되었습니다: jobCandidateId={}", jobCandidateId);
        } else {
            throw new RuntimeException("JobCandProgress를 찾을 수 없습니다: " + jobCandidateId);
        }
    }

    // 내 버전: 직접 지원자 상태 일괄 업데이트 (단일 공고)
    @Transactional
    public int updateCandidateStage(List<Integer> candidateIds, String newStage, Long postId) {
        int updatedCount = 0;
        
        for (Integer candidateId : candidateIds) {
            // 특정 공고와 지원자 조합으로 JobCandProgress 찾기
            var progressOpt = jobCandProgressRepository.findByPost_PostIdAndCandidate_CandidateId(postId, Long.valueOf(candidateId));
            
            if (progressOpt.isPresent()) {
                JobCandProgress progress = progressOpt.get();
                // stage가 "0" 또는 "1y"인 경우 업데이트 (직접 지원자 또는 메일 회신자)
                if ("0".equals(progress.getJobCandCurrStage()) || "1y".equals(progress.getJobCandCurrStage())) {
                    String oldStage = progress.getJobCandCurrStage();
                    progress.setJobCandCurrStage(newStage);
                    progress.setJobCandUpdatedAt(LocalDateTime.now());
                    jobCandProgressRepository.save(progress);
                    
                    // 알림 생성
                    createNotificationOnStageChange(progress, oldStage, newStage);
                    
                    updatedCount++;
                }
            }
        }
        
        return updatedCount;
    }

    // 내 버전: 여러 공고의 직접 지원자 상태 일괄 업데이트
    @Transactional
    public int updateCandidateStageMultiplePosts(List<Map<String, Object>> candidateData, String newStage) {
        int updatedCount = 0;
        
        for (Map<String, Object> data : candidateData) {
            Integer candidateId = (Integer) data.get("candidateId");
            Long postId = Long.valueOf(data.get("postId").toString());
            
            // candidateId null 체크 추가
            if (candidateId == null) {
                log.warn("candidateId가 null입니다. 데이터: {}", data);
                continue; // null인 경우 건너뛰기
            }
            
            // 특정 공고와 지원자 조합으로 JobCandProgress 찾기
            var progressOpt = jobCandProgressRepository.findByPost_PostIdAndCandidate_CandidateId(postId, Long.valueOf(candidateId));
            
            if (progressOpt.isPresent()) {
                JobCandProgress progress = progressOpt.get();
                // stage가 "0" 또는 "1y"인 경우 업데이트 (직접 지원자 또는 메일 회신자)
                if ("0".equals(progress.getJobCandCurrStage()) || "1y".equals(progress.getJobCandCurrStage())) {
                    String oldStage = progress.getJobCandCurrStage();
                    progress.setJobCandCurrStage(newStage);
                    progress.setJobCandUpdatedAt(LocalDateTime.now());
                    jobCandProgressRepository.save(progress);
                    
                    // 알림 생성
                    createNotificationOnStageChange(progress, oldStage, newStage);
                    
                    updatedCount++;
                }
            }
        }
        
        return updatedCount;
    }

    // 팀 버전의 추가 메서드들 (엔티티 필드 확인 후 활성화 예정)
    /*
    public JobCandProgress updateInterviewAnalysisId(Long jobCandidateId, Long analysisId) {
        var progress = jobCandProgressRepository.findByJobCandidateId(jobCandidateId);
        if (progress.isPresent()) {
            progress.get().setAiInterviewAnalysisId(analysisId);
            progress.get().setJobCandUpdatedAt(java.time.LocalDateTime.now());
            return jobCandProgressRepository.save(progress.get());
        } else {
            throw new RuntimeException("JobCandProgress를 찾을 수 없습니다: " + jobCandidateId);
        }
    }
    */

    public Optional<JobCandProgress> getJobCandProgressByGithubLogin(String githubLogin) {
        return jobCandProgressRepository.findByGithubLogin(githubLogin);
    }

    public Optional<JobCandProgressWithCandidateDto> getJobCandProgressWithCandidateById(Long jobCandidateId) {
        // 이 메서드는 DTO 변환이 필요하므로 추후 구현
        return Optional.empty();
    }

    /**
     * Stage 변경 시 알림 생성
     */
    private void createNotificationOnStageChange(JobCandProgress progress, String oldStage, String newStage) {
        try {
            // Stage가 "2y"로 변경될 때 (포트폴리오 제출 완료) - 추가지원자 수락 알림 생성
            if ("2y".equals(newStage) && !"2y".equals(oldStage)) {
                log.info("Stage 2y 변경 감지 - 추가지원자 수락 알림 생성: candidateId={}, postId={}", 
                    progress.getCandidate().getCandidateId(), progress.getPost().getPostId());
                
                candidateNotificationService.createAdditionalApplicantAcceptedNotification(
                    progress.getCandidate().getCandidateId(),
                    progress.getPost().getPostId(),
                    progress.getPost().getCompanyId()
                );
            }
            
            // Stage가 "1y"로 변경될 때 (메일 회신) - 메일 회신 알림 생성
            if ("1y".equals(newStage) && !"1y".equals(oldStage)) {
                log.info("Stage 1y 변경 감지 - 메일 회신 알림 생성: companyAdminId={}, postId={}, candidateId={}", 
                    progress.getPost().getCompanyAdminId(), 
                    progress.getPost().getPostId(), 
                    progress.getCandidate().getCandidateId());
                
                companyNotificationService.createEmailResponseNotification(
                    progress.getPost().getCompanyAdminId(),
                    progress.getPost().getPostId(),
                    progress.getCandidate().getCandidateId()
                );
            }
            
            // Stage가 "2n"로 변경될 때 (면접 일정 잡음) - 면접 일정 알림 생성
            if ("2n".equals(newStage) && !"2n".equals(oldStage)) {
                log.info("Stage 2n 변경 감지 - 면접 일정 알림 생성: companyAdminId={}, postId={}, candidateId={}", 
                    progress.getPost().getCompanyAdminId(), 
                    progress.getPost().getPostId(), 
                    progress.getCandidate().getCandidateId());
                
                companyNotificationService.createInterviewScheduledNotification(
                    progress.getPost().getCompanyAdminId(),
                    progress.getPost().getPostId(),
                    progress.getCandidate().getCandidateId()
                );
            }
            
            // Stage가 "3y"로 변경될 때 (면접 완료) - 면접 완료 알림 생성
            if ("3y".equals(newStage) && !"3y".equals(oldStage)) {
                log.info("Stage 3y 변경 감지 - 면접 완료 알림 생성: companyAdminId={}, postId={}, candidateId={}", 
                    progress.getPost().getCompanyAdminId(), 
                    progress.getPost().getPostId(), 
                    progress.getCandidate().getCandidateId());
                
                companyNotificationService.createInterviewCompletedNotification(
                    progress.getPost().getCompanyAdminId(),
                    progress.getPost().getPostId(),
                    progress.getCandidate().getCandidateId()
                );
            }
            
            // Stage가 "4y"로 변경될 때 (최종 합격) - 최종 합격 알림 생성
            if ("4y".equals(newStage) && !"4y".equals(oldStage)) {
                log.info("Stage 4y 변경 감지 - 최종 합격 알림 생성: companyAdminId={}, postId={}, candidateId={}", 
                    progress.getPost().getCompanyAdminId(), 
                    progress.getPost().getPostId(), 
                    progress.getCandidate().getCandidateId());
                
                companyNotificationService.createFinalResultNotification(
                    progress.getPost().getCompanyAdminId(),
                    progress.getPost().getPostId(),
                    progress.getCandidate().getCandidateId(),
                    true // 합격
                );
            }
            
            // Stage가 "4n"로 변경될 때 (최종 불합격) - 최종 불합격 알림 생성
            if ("4n".equals(newStage) && !"4n".equals(oldStage)) {
                log.info("Stage 4n 변경 감지 - 최종 불합격 알림 생성: companyAdminId={}, postId={}, candidateId={}", 
                    progress.getPost().getCompanyAdminId(), 
                    progress.getPost().getPostId(), 
                    progress.getCandidate().getCandidateId());
                
                companyNotificationService.createFinalResultNotification(
                    progress.getPost().getCompanyAdminId(),
                    progress.getPost().getPostId(),
                    progress.getCandidate().getCandidateId(),
                    false // 불합격
                );
            }
            
        } catch (Exception e) {
            log.error("알림 생성 중 오류 발생: {}", e.getMessage(), e);
        }
    }

    /**
     * Stage 업데이트 (알림 생성 포함)
     */
    public JobCandProgress updateStageWithNotification(Long jobCandidateId, String newStage) {
        var progressOpt = jobCandProgressRepository.findByJobCandidateId(jobCandidateId);
        if (progressOpt.isPresent()) {
            JobCandProgress progress = progressOpt.get();
            String oldStage = progress.getJobCandCurrStage();
            
            // Stage 업데이트
            progress.setJobCandCurrStage(newStage);
            progress.setJobCandUpdatedAt(LocalDateTime.now());
            JobCandProgress savedProgress = jobCandProgressRepository.save(progress);
            
            // 알림 생성
            createNotificationOnStageChange(savedProgress, oldStage, newStage);
            
            return savedProgress;
        } else {
            throw new RuntimeException("JobCandProgress를 찾을 수 없습니다: " + jobCandidateId);
        }
    }

    public List<ResponderDto> getCandidatesAtStage0ByPost(Long postId) {
        return jobCandProgressRepository.findCandidatesAtStage0ByPost(postId);
    }
}

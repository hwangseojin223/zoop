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
import com.zoop.backend.domain.entity.JobCandProgress;
import com.zoop.backend.repository.JobCandProgressRepository;
import com.zoop.backend.repository.InvitationRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class JobCandProgressService {

    private final JobCandProgressRepository jobCandProgressRepository;
    private final InvitationRepository invitationRepository;

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
                // stage가 "0"인 경우에만 업데이트 (직접 지원자)
                if ("0".equals(progress.getJobCandCurrStage())) {
                    progress.setJobCandCurrStage(newStage);
                    progress.setJobCandUpdatedAt(LocalDateTime.now());
                    jobCandProgressRepository.save(progress);
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
            
            // 특정 공고와 지원자 조합으로 JobCandProgress 찾기
            var progressOpt = jobCandProgressRepository.findByPost_PostIdAndCandidate_CandidateId(postId, Long.valueOf(candidateId));
            
            if (progressOpt.isPresent()) {
                JobCandProgress progress = progressOpt.get();
                // stage가 "0"인 경우에만 업데이트 (직접 지원자)
                if ("0".equals(progress.getJobCandCurrStage())) {
                    progress.setJobCandCurrStage(newStage);
                    progress.setJobCandUpdatedAt(LocalDateTime.now());
                    jobCandProgressRepository.save(progress);
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
}

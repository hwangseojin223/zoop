package com.zoop.backend.service;

import java.util.List;
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
            throw new RuntimeException("해당 jobCandidateId를 찾을 수 없습니다: " + jobCandidateId);
        }
    }

    public JobCandProgress updateInterviewAnalysisId(Long jobCandidateId, Long analysisId) {
        Optional<JobCandProgress> optional = jobCandProgressRepository.findById(jobCandidateId);
        if (optional.isPresent()) {
            JobCandProgress progress = optional.get();
            progress.setAiIntrvwAnalysisId(analysisId);
            return jobCandProgressRepository.save(progress);
        }
        throw new RuntimeException("JobCandProgress not found with id: " + jobCandidateId);
    }

    public Optional<JobCandProgress> getJobCandProgressByGithubLogin(String githubLogin) {
        return jobCandProgressRepository.findByGithubLogin(githubLogin);
    }

    public Optional<JobCandProgressWithCandidateDto> getJobCandProgressWithCandidateById(Long jobCandidateId) {
        Optional<JobCandProgress> progressOpt = jobCandProgressRepository.findById(jobCandidateId);
        if (progressOpt.isPresent()) {
            JobCandProgress progress = progressOpt.get();
            return Optional.of(JobCandProgressWithCandidateDto.builder()
                .jobCandidateId(progress.getJobCandidateId())
                .githubLogin(progress.getGithubLogin())
                .jobCandCurrStage(progress.getJobCandCurrStage())
                .candidateEmail(progress.getCandidate() != null ? progress.getCandidate().getCandidateEmail() : null)
                .candidateName(progress.getCandidate() != null ? progress.getCandidate().getCandidateName() : null)
                .candidatePhoneNumber(progress.getCandidate() != null ? progress.getCandidate().getCandidatePhoneNumber() : null)
                .postId(progress.getPost() != null ? progress.getPost().getPostId() : null)
                .postTitle(progress.getPost() != null ? progress.getPost().getPostTitle() : null)
                .candidateId(progress.getCandidate() != null ? progress.getCandidate().getCandidateId() : null)
                .build());
        }
        return Optional.empty();
    }
}

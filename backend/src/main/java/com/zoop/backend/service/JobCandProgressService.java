package com.zoop.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zoop.backend.domain.dto.JobCandProgressWithCandidateDto;
import com.zoop.backend.domain.dto.ResponderDto;
import com.zoop.backend.domain.entity.JobCandProgress;
import com.zoop.backend.repository.JobCandProgressRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class JobCandProgressService {

    private final JobCandProgressRepository jobCandProgressRepository;

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

    public List<ResponderDto> getCandidatesAtStage2yByPost(Long postId) {
        return jobCandProgressRepository.findCandidatesAtStage2yByPost(postId);
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
package com.zoop.backend.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zoop.backend.domain.dto.JobPostingResponseDto;
import com.zoop.backend.domain.entity.JobCandProgress;
import com.zoop.backend.repository.JobCandProgressRepository;

@Service
public class CandidateJobPostingService {
    private final JobCandProgressRepository jobCandProgressRepository;

    @Autowired
    public CandidateJobPostingService(JobCandProgressRepository jobCandProgressRepository) {
        this.jobCandProgressRepository = jobCandProgressRepository;
    }

    @Transactional(readOnly = true, noRollbackFor = Exception.class)
    public List<JobPostingResponseDto> getJobPostingsForCandidate(Integer candidateId) {
        try {
            // 여기서 Integer로 명시적 변환이 필요할 수 있습니다
            List<JobCandProgress> progressList = jobCandProgressRepository.findByCandidate_CandidateId(candidateId);
            
            if (progressList.isEmpty()) {
                return new ArrayList<>();
            }
            
            List<JobPostingResponseDto> result = new ArrayList<>();
            
            for (JobCandProgress progress : progressList) {
                if (progress.getPost() != null && progress.getPost().getCompany() != null) {
                    try {
                        String postedDate = progress.getPost().getPostPostedDate() != null ? 
                    progress.getPost().getPostPostedDate().toString() : null;
                        String expiryDate = progress.getPost().getPostExpiryDate() != null ? 
                    progress.getPost().getPostExpiryDate().toString() : null;

                        JobPostingResponseDto dto = new JobPostingResponseDto(
                                progress.getPost().getPostId(),
                                progress.getPost().getPostTitle(),
                                progress.getPost().getCompany().getCompanyName(),
                                progress.getPost().getPostLocation(),
                                progress.getJobCandCurrStage(),
                                progress.getPost().getPostProgrammingLanguage(),
                                postedDate,
                                expiryDate
                        );
                        result.add(dto);
                    } catch (Exception e) {
                        System.err.println("Error mapping JobCandProgress to DTO: " + e.getMessage());
                    }
                }
            }
            
            return result;
        } catch (Exception e) {
            System.err.println("Error in getJobPostingsForCandidate: " + e.getMessage());
            return new ArrayList<>();
        }
    }

}

package com.zoop.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zoop.backend.domain.dto.ResponderDto;
import com.zoop.backend.domain.entity.JobCandProgress;
import com.zoop.backend.repository.JobCandProgressRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JobCandProgressService {

    private final JobCandProgressRepository jobCandProgressRepository;

    @Transactional(readOnly = true)
    public List<ResponderDto> getCandidatesAtStage2yByPost(Long postId) {
        System.out.println("2y 스테이지 후보자 조회: " + postId);
        List<ResponderDto> list = jobCandProgressRepository.findCandidatesAtStage2yByPost(postId);
        System.out.println("조회된 후보자 수: " + list.size());
        return list;
    }

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
}

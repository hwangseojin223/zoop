package com.zoop.backend.service;

import com.zoop.backend.domain.dto.AiAnalysisResultDto;
import com.zoop.backend.domain.entity.AiAnalysisResult;
import com.zoop.backend.domain.entity.GithubSearchResult;
import com.zoop.backend.repository.AiAnalysisResultRepository;
import com.zoop.backend.repository.GithubSearchResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AiAnalysisResultService {

    private final AiAnalysisResultRepository aiAnalysisResultRepository;
    private final GithubSearchResultRepository githubSearchResultRepository;

    @Transactional
    public AiAnalysisResult saveAiAnalysisResult(AiAnalysisResultDto dto) {
        AiAnalysisResult entity = AiAnalysisResult.builder()
                .analysisType(dto.getAnalysisType())
                .githubSearchResultId(dto.getGithubSearchResultId())
                .jobCandidateId(dto.getJobCandidateId())
                .analysisData(dto.getAnalysisData())
                .analysisScore(dto.getAnalysisScore())
                .analysisDate(dto.getAnalysisDate() != null ? dto.getAnalysisDate() : LocalDateTime.now())
                .analysisCreatedAt(dto.getAnalysisCreatedAt() != null ? dto.getAnalysisCreatedAt() : LocalDateTime.now())
                .build();

        return aiAnalysisResultRepository.save(entity);
    }

    public Optional<AiAnalysisResult> findByGithubSearchResultId(Long githubSearchResultId) {
        return aiAnalysisResultRepository.findByGithubSearchResultId(githubSearchResultId);
    }

    public List<AiAnalysisResult> findByAnalysisType(String analysisType) {
        return aiAnalysisResultRepository.findByAnalysisType(analysisType);
    }

    public List<AiAnalysisResult> findByPostId(Long postId) {
        return aiAnalysisResultRepository.findByPostId(postId);
    }

    public Optional<AiAnalysisResult> findById(Long analysisId) {
        return aiAnalysisResultRepository.findById(analysisId);
    }

    public List<AiAnalysisResult> findAll() {
        return aiAnalysisResultRepository.findAll();
    }
} 
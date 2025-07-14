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

        AiAnalysisResult saved = aiAnalysisResultRepository.save(entity);

        // GitHub 검색 결과의 ai_github_analysis_id 업데이트
        if (dto.getGithubSearchResultId() != null) {
            Optional<GithubSearchResult> githubResult = githubSearchResultRepository.findById(dto.getGithubSearchResultId());
            githubResult.ifPresent(result -> {
                result.setAiGithubAnalysisId(saved.getAnalysisId());
                githubSearchResultRepository.save(result);
            });
        }

        return saved;
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

    // 내 버전: jobCandidateId와 analysisType으로 최신순 정렬 조회
    public List<AiAnalysisResult> findByJobCandidateIdAndAnalysisType(Long jobCandidateId, String analysisType) {
        return aiAnalysisResultRepository.findByJobCandidateIdAndAnalysisTypeOrderByAnalysisDateDesc(jobCandidateId, analysisType);
    }

    // 팀 버전: 분석 결과 삭제 기능
    @Transactional
    public boolean deleteById(Long analysisId) {
        Optional<AiAnalysisResult> result = aiAnalysisResultRepository.findById(analysisId);
        if (result.isPresent()) {
            aiAnalysisResultRepository.deleteById(analysisId);
            return true;
        }
        return false;
    }
} 
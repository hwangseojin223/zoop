package com.zoop.backend.service;

import com.zoop.backend.domain.dto.GithubSearchResultDto;
import com.zoop.backend.domain.entity.GithubSearchResult;
import com.zoop.backend.repository.GithubSearchResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
<<<<<<< HEAD
import java.util.List;
import java.util.Optional;
import com.zoop.backend.domain.dto.GithubSearchResultWithStageDto;
import com.zoop.backend.repository.GithubSearchResultRepository;
=======
import java.util.Optional;
>>>>>>> feat/93/interview-ai

@Service
@RequiredArgsConstructor
public class GithubSearchResultService {

    private final GithubSearchResultRepository githubSearchResultRepository;

    @Transactional
    public GithubSearchResult saveGithubSearchResult(GithubSearchResultDto dto) {
        GithubSearchResult entity = GithubSearchResult.builder()
                .postId(dto.getPostId())
                .githubLogin(dto.getGithubLogin())
                .githubProfileUrl(dto.getGithubProfileUrl())
                .analysisScore(dto.getAnalysisScore())
                .candidateEmail(dto.getCandidateEmail())
                .githubSearchDate(LocalDateTime.now())
                .githubCreatedAt(LocalDateTime.now())
                .aiGithubAnalysisId(dto.getAiGithubAnalysisId())
                .build();

        return githubSearchResultRepository.save(entity);
    }

    public Optional<GithubSearchResult> findById(Long githubSearchResultId) {
        return githubSearchResultRepository.findById(githubSearchResultId);
    }
<<<<<<< HEAD

    public List<GithubSearchResultWithStageDto> getSearchResultsWithStage(Long postId) {
        return githubSearchResultRepository.findSearchResultsWithStageByPostId(postId);
    }
=======
>>>>>>> feat/93/interview-ai
} 
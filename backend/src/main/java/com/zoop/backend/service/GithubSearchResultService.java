package com.zoop.backend.service;

import com.zoop.backend.domain.dto.GithubSearchResultDto;
import com.zoop.backend.domain.entity.GithubSearchResult;
import com.zoop.backend.repository.GithubSearchResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

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
} 
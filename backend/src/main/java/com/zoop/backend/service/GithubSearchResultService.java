package com.zoop.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.zoop.backend.domain.dto.GithubSearchResultWithStageDto;
import com.zoop.backend.repository.GithubSearchResultRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class GithubSearchResultService {

    private final GithubSearchResultRepository githubSearchResultsRepository;

    public List<GithubSearchResultWithStageDto> getSearchResultsWithStage(Long postId) {
        return githubSearchResultsRepository.findSearchResultsWithStageByPostId(postId);
    }
}

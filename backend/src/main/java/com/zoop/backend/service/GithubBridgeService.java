package com.zoop.backend.service;

import com.zoop.backend.config.GithubBridgeConfig;
import com.zoop.backend.domain.dto.FilterRequestDto;
import com.zoop.backend.domain.dto.GithubCandidateDto;
import com.zoop.backend.domain.entity.GithubSearchResult;
import com.zoop.backend.repository.GithubSearchResultRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@RequiredArgsConstructor
@Service
public class GithubBridgeService {

    private final GithubSearchResultRepository resultRepo;
    private final RestTemplate restTemplate = new RestTemplate();
    private final GithubBridgeConfig config;

    @Transactional
    public void fetchFromPythonAndSave(FilterRequestDto filter) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<FilterRequestDto> requestEntity = new HttpEntity<>(filter, headers);
    
        ResponseEntity<Map> response = restTemplate.exchange(
            config.getUrl() + "/search", HttpMethod.POST, requestEntity, Map.class
        );
        
        List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
        
        
    
        for (Map<String, Object> user : candidates) {
            GithubSearchResult result = GithubSearchResult.builder()
                .postId(filter.getPostId())
                .githubLogin((String) user.get("login"))
                .githubProfileUrl((String) user.get("profile_url"))
                .candidateEmail((String) user.get("email"))
                .analysisScore(user.get("score") != null ? ((Number) user.get("score")).doubleValue() : null)
                .githubSearchDate(LocalDateTime.now())
                .githubCreatedAt(LocalDateTime.now())
                .build();
    
            resultRepo.save(result);
        }
    }
    

    @Transactional
    public void saveGithubCandidates(Long postId, List<GithubCandidateDto> candidates) {
        for (GithubCandidateDto dto : candidates) {
            GithubSearchResult result = new GithubSearchResult();
            result.setPostId(postId);
            result.setGithubLogin(dto.getLogin());
            result.setGithubProfileUrl(dto.getProfileUrl());
            result.setCandidateEmail(dto.getEmail());
            result.setGithubSearchDate(LocalDateTime.now());
            result.setGithubCreatedAt(LocalDateTime.now());
            resultRepo.save(result); // ✅ githubSearchResultRepository → resultRepo
        }
    }
}
package com.zoop.backend.service;

import com.zoop.backend.config.GithubBridgeConfig;
import com.zoop.backend.domain.dto.FilterRequestDto;
import com.zoop.backend.domain.dto.GithubCandidateDto;
import com.zoop.backend.domain.entity.GithubSearchResult;
import com.zoop.backend.repository.GithubSearchResultRepository;
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

    public void fetchFromPythonAndSave(FilterRequestDto filter) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<FilterRequestDto> requestEntity = new HttpEntity<>(filter, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
            config.getUrl() + "/search", HttpMethod.POST, requestEntity, Map.class
        );

        List<Map<String, String>> candidates = (List<Map<String, String>>) response.getBody().get("candidates");

        for (Map<String, String> user : candidates) {
            GithubSearchResult result = GithubSearchResult.builder()
                    .postId(filter.getPostId())
                    .githubLogin(user.get("login"))
                    .githubProfileUrl(user.get("profile_url"))
                    .githubCreatedAt(LocalDateTime.now())
                    .githubSearchDate(LocalDateTime.now())
                    .build();
            resultRepo.save(result);
        }
    }
}


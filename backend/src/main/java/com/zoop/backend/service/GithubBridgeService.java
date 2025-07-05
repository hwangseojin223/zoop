package com.zoop.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.zoop.backend.config.GithubBridgeConfig;
import com.zoop.backend.domain.dto.FilterRequestDto;
import com.zoop.backend.domain.dto.GithubCandidateDto;
import com.zoop.backend.domain.entity.GithubSearchResult;
import com.zoop.backend.domain.entity.JobCandProgress;
import com.zoop.backend.repository.GithubSearchResultRepository;
import com.zoop.backend.repository.JobCandProgressRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Slf4j
@Service
public class GithubBridgeService {

    private final GithubSearchResultRepository resultRepo;
    private final RestTemplate restTemplate = new RestTemplate();
    private final GithubBridgeConfig config;
    private final JobCandProgressRepository jobCandProgressRepository;

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

            /**
             * github_search에 저장과 동시에 이메일 있는 사람만 
             * job_cand_progress에 저장, 이 때 stage=1n
             */
            if (!"not_found@example.com".equals(user.get("email"))) {
                String githubLogin = (String) user.get("login");

                // 중복 방지: 동일한 postId + githubLogin 조합이 존재하지 않을 때만 저장
                if (!jobCandProgressRepository.existsByPostIdAndGithubLogin(filter.getPostId(), githubLogin)) {
                    JobCandProgress progress = JobCandProgress.builder()
                        .postId(filter.getPostId())
                        .githubLogin(githubLogin)
                        .jobCandCurrStage("1n") // 기본 단계
                        .jobCandCreatedAt(LocalDateTime.now())
                        .jobCandUpdatedAt(LocalDateTime.now())
                        .build();

                    jobCandProgressRepository.save(progress);
                    log.info("GitHub 후보자 JobCandProgressdp 저장됨: {}", githubLogin);
                }
            }



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
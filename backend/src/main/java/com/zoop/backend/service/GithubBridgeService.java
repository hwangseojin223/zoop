package com.zoop.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zoop.backend.config.GithubBridgeConfig;
import com.zoop.backend.domain.dto.FilterRequestDto;
import com.zoop.backend.domain.dto.GithubCandidateDto;
import com.zoop.backend.domain.entity.GithubSearchResult;
import com.zoop.backend.domain.entity.AiAnalysisResult;
import com.zoop.backend.domain.entity.JobCandProgress;
import com.zoop.backend.repository.GithubSearchResultRepository;
import com.zoop.backend.repository.AiAnalysisResultRepository;
import com.zoop.backend.repository.PostRepository;
import com.zoop.backend.domain.entity.Post;
import com.zoop.backend.repository.JobCandProgressRepository;
import com.zoop.backend.repository.CandidateRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.Arrays;

@RequiredArgsConstructor
@Service
public class GithubBridgeService {

    private final GithubSearchResultRepository resultRepo;
    private final AiAnalysisResultRepository aiAnalysisResultRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final GithubBridgeConfig config;
    private final PostRepository postRepository;
    private final JobCandProgressRepository jobCandProgressRepository;
    private final CandidateRepository candidateRepository;

    @Transactional
    public void fetchFromPythonAndSave(FilterRequestDto filter) {
        try {
            // null 체크 추가
            if (filter == null) {
                throw new RuntimeException("FilterRequestDto가 null입니다.");
            }
            
            if (filter.getPostId() == null) {
                throw new RuntimeException("Post ID가 null입니다.");
            }
            
            ObjectMapper mapper = new ObjectMapper();
            // 1. postId로 Post 엔티티 조회
            Post post = postRepository.findById(filter.getPostId())
                .orElseThrow(() -> new RuntimeException("해당 postId의 공고가 없습니다: " + filter.getPostId()));

            // 2. Post 엔티티에서 필터 정보 추출 (콤마로 구분된 문자열을 리스트로 변환)
            java.util.List<String> languages = post.getPostProgrammingLanguage() != null && !post.getPostProgrammingLanguage().isBlank()
                ? Arrays.asList(post.getPostProgrammingLanguage().split(",")) : new java.util.ArrayList<>();
            java.util.List<String> regions = post.getPostLocation() != null && !post.getPostLocation().isBlank()
                ? Arrays.asList(post.getPostLocation().split(",")) : new java.util.ArrayList<>();
            int headcount = post.getPostHeadcount() != null ? post.getPostHeadcount() : 5; // 기본값 5
            String idealCandidate = post.getPostIdealCandidate();

            // 3. Python API에 보낼 Map 생성
            Map<String, Object> pythonFilter = new HashMap<>();
            pythonFilter.put("languages", languages);
            pythonFilter.put("regions", regions);
            pythonFilter.put("nationwide", false); // 필요시 post에서 추출
            pythonFilter.put("headcount", headcount);
            pythonFilter.put("idealCandidate", idealCandidate != null ? idealCandidate : "");
            System.out.println("[DEBUG] Python으로 보낼 JSON: " + mapper.writeValueAsString(pythonFilter));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(pythonFilter, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                config.getUrl() + "/search", HttpMethod.POST, requestEntity, Map.class
            );

            if (response.getBody() == null) {
                throw new RuntimeException("Python API에서 응답이 null입니다.");
            }

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
            
            if (candidates == null) {
                System.out.println("[WARNING] Python API에서 candidates가 null입니다.");
                return;
            }

            for (Map<String, Object> user : candidates) {
                // 디버깅: 받은 데이터 출력
                System.out.println("[DEBUG] 받은 사용자 데이터: " + user);
                System.out.println("[DEBUG] llm_score: " + user.get("llm_score") + " (타입: " + (user.get("llm_score") != null ? user.get("llm_score").getClass().getSimpleName() : "null") + ")");
                
                // 점수 파싱 개선 (llm_score 또는 score 둘 다 시도)
                Double score = null;
                if (user.get("llm_score") != null) {
                    if (user.get("llm_score") instanceof Number) {
                        score = ((Number) user.get("llm_score")).doubleValue();
                    } else if (user.get("llm_score") instanceof String) {
                        try {
                            score = Double.parseDouble((String) user.get("llm_score"));
                        } catch (NumberFormatException e) {
                            System.err.println("[ERROR] llm_score 파싱 실패: " + user.get("llm_score"));
                        }
                    }
                } else if (user.get("score") != null) {
                    if (user.get("score") instanceof Number) {
                        score = ((Number) user.get("score")).doubleValue();
                    } else if (user.get("score") instanceof String) {
                        try {
                            score = Double.parseDouble((String) user.get("score"));
                        } catch (NumberFormatException e) {
                            System.err.println("[ERROR] score 파싱 실패: " + user.get("score"));
                        }
                    }
                }
                
                // GitHub 검색 결과 저장
                System.out.println("[DEBUG] GitHub 검색 결과 저장 시작: " + user.get("login"));
                
                GithubSearchResult result = GithubSearchResult.builder()
                    .postId(post.getPostId())
                    .githubLogin((String) user.get("login"))
                    .githubProfileUrl((String) user.get("profile_url"))
                    .candidateEmail((String) user.get("email"))
                    .analysisScore(score)
                    .githubSearchDate(LocalDateTime.now())
                    .githubCreatedAt(LocalDateTime.now())
                    .build();

                System.out.println("[DEBUG] 저장할 GitHub 결과: " + result);
                GithubSearchResult savedResult = resultRepo.save(result);
                System.out.println("[DEBUG] GitHub 결과 저장 완료: ID = " + savedResult.getGithubSearchResultId());
                
                // === JobCandProgress 저장 ===
                String githubLogin = (String) user.get("login");
                Long candidateId = candidateRepository.findByGithubLogin(githubLogin)
                    .map(c -> c.getCandidateId())
                    .orElse(null);
                // postId + githubLogin 조합으로 중복 체크
                Optional<JobCandProgress> existing = jobCandProgressRepository.findByPostIdAndGithubLogin(post.getPostId(), githubLogin);
                JobCandProgress progress = existing.orElseGet(JobCandProgress::new);
                progress.setPostId(post.getPostId());
                progress.setGithubLogin(githubLogin);
                progress.setCandidateId(candidateId); // null이어도 OK
                progress.setJobCandCurrStage("1n");
                progress.setJobCandCreatedAt(LocalDateTime.now());
                progress.setJobCandUpdatedAt(LocalDateTime.now());
                jobCandProgressRepository.save(progress);
                // === JobCandProgress 저장 끝 ===
                
                // AI 분석 결과 저장
                if (user.get("analysis") != null) {
                    try {
                        System.out.println("[DEBUG] AI 분석 데이터 저장 시작: " + user.get("login"));
                        
                        // 필요한 정보만 추출
                        String analysisText = (String) user.get("analysis");
                        String topLanguage = "";
                        String followers = "";
                        List<String> languagesList = new ArrayList<>();
                        
                        // details에서 top_language와 languages 추출
                        if (user.get("details") != null) {
                            Map<String, Object> details = (Map<String, Object>) user.get("details");
                            topLanguage = details.get("top_language") != null ? (String) details.get("top_language") : "";
                            if (details.get("languages") != null) {
                                Object languagesObj = details.get("languages");
                                if (languagesObj instanceof List) {
                                    languagesList = (List<String>) languagesObj;
                                }
                            }
                        }
                        
                        // followers 추출
                        if (user.get("followers") != null) {
                            followers = user.get("followers").toString();
                        }
                        
                        // 간결한 분석 데이터 생성 (원래 형식에서 필요한 필드만)
                        String analysisData = mapper.writeValueAsString(Map.of(
                            "followers", followers,
                            "top_language", topLanguage,
                            "languages", languagesList,
                            "analysis", analysisText
                        ));
                        
                        AiAnalysisResult aiResult = AiAnalysisResult.builder()
                            .analysisType("github")
                            .githubSearchResultId(savedResult.getGithubSearchResultId())
                            .analysisData(analysisData)
                            .analysisScore(score)
                            .analysisDate(LocalDateTime.now())
                            .analysisCreatedAt(LocalDateTime.now())
                            .build();
                        
                        System.out.println("[DEBUG] AI 분석 결과 저장: " + aiResult);
                        AiAnalysisResult savedAiResult = aiAnalysisResultRepository.save(aiResult);
                        System.out.println("[DEBUG] AI 분석 결과 저장 완료: ID = " + savedAiResult.getAnalysisId());
                        
                        // GitHub 검색 결과에 AI 분석 ID 업데이트
                        savedResult.setAiGithubAnalysisId(savedAiResult.getAnalysisId());
                        resultRepo.save(savedResult);
                        
                        System.out.println("[INFO] AI 분석 결과 저장 완료: " + savedResult.getGithubLogin());
                    } catch (Exception e) {
                        System.err.println("[ERROR] AI 분석 결과 저장 실패: " + e.getMessage());
                        e.printStackTrace();
                    }
                }
            }
            
            System.out.println("[INFO] " + candidates.size() + "명의 후보자가 저장되었습니다.");
            
        } catch (Exception e) {
            System.err.println("[ERROR] GitHub 검색 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            // 트랜잭션 롤백을 위해 예외를 다시 던짐
            throw new RuntimeException("GitHub 검색 중 오류가 발생했습니다: " + e.getMessage(), e);
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

    // 인재상 저장
    public void saveIdealCandidateToPost(Long postId, String idealCandidate) {
        postRepository.findById(postId).ifPresent(post -> {
            post.setPostIdealCandidate(idealCandidate);
            postRepository.save(post);
        });
    }
}
package com.zoop.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zoop.backend.domain.dto.FilterRequestDto;
import com.zoop.backend.domain.dto.GithubSearchResultDto;
import com.zoop.backend.domain.dto.GithubSearchResultWithStageDto;
import com.zoop.backend.domain.entity.GithubSearchResult;
import com.zoop.backend.domain.entity.AiAnalysisResult;
import com.zoop.backend.domain.entity.JobCandProgress;
import com.zoop.backend.repository.GithubSearchResultRepository;
import com.zoop.backend.repository.JobCandProgressRepository;
import com.zoop.backend.repository.AiAnalysisResultRepository;
import com.zoop.backend.service.GithubBridgeService;
import com.zoop.backend.service.GithubSearchResultService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name="GithubSearchController", description = "GitHub 후보자 검색 관련 API")
@RestController
@RequestMapping("/api/github-search")
@RequiredArgsConstructor
public class GithubSearchController {

    private final GithubBridgeService githubBridgeService;
    private final GithubSearchResultRepository resultRepo;
    private final GithubSearchResultService githubSearchResultService;
    private final JobCandProgressRepository jobCandProgressRepository;
    private final AiAnalysisResultRepository aiAnalysisResultRepository;

    @Operation(summary = "GitHub 후보자 검색 및 결과 저장", description = "FastAPI를 통해 GitHub에서 후보자를 검색하고 결과를 저장합니다.")
    @ApiResponses(value={
        @ApiResponse(responseCode = "200", description = "GitHub 후보자 검색 완료 메시지 반환",
            content=@Content(schema = @Schema(implementation = String.class))),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 (필수 데이터 누락, 형식 오류 등)"),
        @ApiResponse(responseCode = "500", description = "서버 내부 오류 또는 FASTAPI 통신 오류")
    })
    @PostMapping
    public ResponseEntity<?> filterAndStore(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "GitHub 검색 및 필터링을 위한 요청 데이터 (Post ID 포함)",
            required = true,
            content = @Content(schema = @Schema(implementation = FilterRequestDto.class))
        )
        @RequestBody FilterRequestDto dto) {
        
        if (dto == null) {
            return ResponseEntity.badRequest().body("요청 데이터가 null입니다.");
        }
        
        if (dto.getPostId() == null) {
            return ResponseEntity.badRequest().body("Post ID가 null입니다.");
        }
        
        System.out.println("🔍 GitHub 후보자 검색 시작: " + dto.getPostId());
        
        try {
            githubBridgeService.fetchFromPythonAndSave(dto);
            return ResponseEntity.ok("✅ FastAPI에서 GitHub 후보자 검색 완료");
        } catch (Exception e) {
            System.err.println("GitHub 검색 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("GitHub 검색 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @Operation(summary = "게시글 ID로 GitHub 검색 결과 조회", description = "특정 채용 공고에 대한 GitHub 검색 결과를 조회합니다. 이메일 존재  여부와 점수 기준으로 정렬됩니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "GitHub 검색 결과 목록 반환",
            content = @Content(schema = @Schema(implementation = GithubSearchResult.class))),
        @ApiResponse(responseCode = "404", description = "해당 게시글 ID에 대한 검색 결과 없음"),
        @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @GetMapping("/by-post/{postId}")
    public ResponseEntity<List<GithubSearchResult>> getCandidatesByPost(
        @Parameter(description = "GitHub 검색 결과를 조회할 채용 공고의 ID", required = true, example="1")
        @PathVariable Long postId) {
        List<GithubSearchResult> list = resultRepo.findSortedByEmailPresenceAndScore(postId);
        return ResponseEntity.ok(list);
    }

    @Operation(summary = "GitHub 검색 결과 직접 저장", description = "Python API에서 분석한 GitHub 검색 결과를 직접 저장합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "GitHub 검색 결과 저장 성공",
            content = @Content(schema = @Schema(implementation = GithubSearchResult.class))),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @GetMapping("/results")
    public ResponseEntity<List<GithubSearchResult>> getAllGithubSearchResults() {
        List<GithubSearchResult> results = resultRepo.findAll();
        return ResponseEntity.ok(results);
    }

    @Operation(summary = "GitHub 검색 결과 직접 저장", description = "Python API에서 분석한 GitHub 검색 결과를 직접 저장합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "GitHub 검색 결과 저장 성공",
            content = @Content(schema = @Schema(implementation = GithubSearchResult.class))),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @PostMapping("/results")
    public ResponseEntity<GithubSearchResult> saveGithubSearchResult(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "GitHub 검색 결과 저장을 위한 데이터",
            required = true,
            content = @Content(schema = @Schema(implementation = GithubSearchResultDto.class))
        )
        @RequestBody GithubSearchResultDto dto) {
        
        GithubSearchResult saved = githubSearchResultService.saveGithubSearchResult(dto);
        return ResponseEntity.status(201).body(saved);
    }

    @Operation(summary = "게시글 ID로 GitHub 검색 결과 조회 (필터링 상태)", description = "특정 채용 공고에 대한 GitHub 검색 결과를 조회합니다. 이메일 존재  여부와 점수 기준으로 정렬됩니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "GitHub 검색 결과 목록 반환",
            content = @Content(schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "404", description = "해당 게시글 ID에 대한 검색 결과 없음"),
        @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @GetMapping("/by-post/{postId}/filtering")
    public ResponseEntity<?> getFilteringCandidatesByPost(@PathVariable Long postId) {
        // 1. 1n(필터링) 상태 githubLogin 리스트 조회
        List<String> githubLogins = jobCandProgressRepository.findGithubLoginsByPostIdAndFilteringStage(postId);
        if (githubLogins.isEmpty()) return ResponseEntity.ok(List.of());
        // 2. github_search_results에서 후보자 정보 조회
        List<GithubSearchResult> candidates = resultRepo.findByPostIdAndGithubLoginIn(postId, githubLogins);
        // 3. AI 분석 결과 조회
        List<Long> searchResultIds = candidates.stream().map(GithubSearchResult::getGithubSearchResultId).collect(Collectors.toList());
        List<AiAnalysisResult> aiResults = aiAnalysisResultRepository.findByGithubSearchResultIds(searchResultIds);
        // 4. JobCandProgress 정보 조회
        List<JobCandProgress> progressList = jobCandProgressRepository.findByPostIdAndGithubLoginIn(postId, githubLogins);
        // 5. 후보자 + 분석결과 + 진행상태 매핑
        List<Map<String, Object>> result = candidates.stream().map(c -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("candidate", c);
            aiResults.stream().filter(a -> a.getGithubSearchResultId().equals(c.getGithubSearchResultId())).findFirst().ifPresent(a -> map.put("aiAnalysis", a));
            progressList.stream().filter(p -> p.getGithubLogin().equals(c.getGithubLogin())).findFirst().ifPresent(p -> {
                c.setJobCandCurrStage(p.getJobCandCurrStage());
                map.put("jobCandidateId", p.getJobCandidateId());
            });
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "게시글 ID로 GitHub 검색 결과 조회 (전체 후보자)", description = "특정 채용 공고에 대한 모든 GitHub 검색 결과를 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "GitHub 검색 결과 목록 반환",
            content = @Content(schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "404", description = "해당 게시글 ID에 대한 검색 결과 없음"),
        @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @GetMapping("/by-post/{postId}/all")
    public ResponseEntity<?> getAllCandidatesByPost(@PathVariable Long postId) {
        // 1. 전체 githubLogin 리스트 조회
        List<String> githubLogins = jobCandProgressRepository.findGithubLoginsByPostId(postId);
        if (githubLogins.isEmpty()) return ResponseEntity.ok(List.of());
        // 2. github_search_results에서 후보자 정보 조회
        List<GithubSearchResult> candidates = resultRepo.findByPostIdAndGithubLoginIn(postId, githubLogins);
        // 3. AI 분석 결과 조회
        List<Long> searchResultIds = candidates.stream().map(GithubSearchResult::getGithubSearchResultId).collect(Collectors.toList());
        List<AiAnalysisResult> aiResults = aiAnalysisResultRepository.findByGithubSearchResultIds(searchResultIds);
        // 4. JobCandProgress 정보 조회
        List<JobCandProgress> progressList = jobCandProgressRepository.findByPostIdAndGithubLoginIn(postId, githubLogins);
        // 5. 후보자 + 분석결과 + 진행상태 매핑
        List<Map<String, Object>> result = candidates.stream().map(c -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("candidate", c);
            aiResults.stream().filter(a -> a.getGithubSearchResultId().equals(c.getGithubSearchResultId())).findFirst().ifPresent(a -> map.put("aiAnalysis", a));
            progressList.stream().filter(p -> p.getGithubLogin().equals(c.getGithubLogin())).findFirst().ifPresent(p -> {
                c.setJobCandCurrStage(p.getJobCandCurrStage());
                map.put("jobCandidateId", p.getJobCandidateId());
            });
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "게시글 ID로 GitHub 검색 결과 조회 (미회신자)", description = "특정 채용 공고에 대한 미회신자 GitHub 검색 결과를 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "GitHub 검색 결과 목록 반환",
            content = @Content(schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "404", description = "해당 게시글 ID에 대한 검색 결과 없음"),
        @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @GetMapping("/by-post/{postId}/no-response")
    public ResponseEntity<?> getNoResponseCandidatesByPost(@PathVariable Long postId) {
        // 1. 미회신자(1n, 2n) githubLogin 리스트 조회
        List<String> githubLogins = jobCandProgressRepository.findGithubLoginsByPostIdAndNoResponseStage(postId);
        if (githubLogins.isEmpty()) return ResponseEntity.ok(List.of());
        // 2. github_search_results에서 후보자 정보 조회
        List<GithubSearchResult> candidates = resultRepo.findByPostIdAndGithubLoginIn(postId, githubLogins);
        // 3. AI 분석 결과 조회
        List<Long> searchResultIds = candidates.stream().map(GithubSearchResult::getGithubSearchResultId).collect(Collectors.toList());
        List<AiAnalysisResult> aiResults = aiAnalysisResultRepository.findByGithubSearchResultIds(searchResultIds);
        // 4. JobCandProgress 정보 조회
        List<JobCandProgress> progressList = jobCandProgressRepository.findByPostIdAndGithubLoginIn(postId, githubLogins);
        // 5. 후보자 + 분석결과 + 진행상태 매핑
        List<Map<String, Object>> result = candidates.stream().map(c -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("candidate", c);
            aiResults.stream().filter(a -> a.getGithubSearchResultId().equals(c.getGithubSearchResultId())).findFirst().ifPresent(a -> map.put("aiAnalysis", a));
            progressList.stream().filter(p -> p.getGithubLogin().equals(c.getGithubLogin())).findFirst().ifPresent(p -> {
                c.setJobCandCurrStage(p.getJobCandCurrStage());
                map.put("jobCandidateId", p.getJobCandidateId());
            });
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "게시글 ID로 GitHub 검색 결과 조회 (회신자)", description = "특정 채용 공고에 대한 회신자 GitHub 검색 결과를 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "GitHub 검색 결과 목록 반환",
            content = @Content(schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "404", description = "해당 게시글 ID에 대한 검색 결과 없음"),
        @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @GetMapping("/by-post/{postId}/response")
    public ResponseEntity<?> getResponseCandidatesByPost(@PathVariable Long postId) {
        // 1. 회신자(2y) githubLogin 리스트 조회
        List<String> githubLogins = jobCandProgressRepository.findGithubLoginsByPostIdAndResponseStage(postId);
        if (githubLogins.isEmpty()) return ResponseEntity.ok(List.of());
        // 2. github_search_results에서 후보자 정보 조회
        List<GithubSearchResult> candidates = resultRepo.findByPostIdAndGithubLoginIn(postId, githubLogins);
        // 3. AI 분석 결과 조회
        List<Long> searchResultIds = candidates.stream().map(GithubSearchResult::getGithubSearchResultId).collect(Collectors.toList());
        List<AiAnalysisResult> aiResults = aiAnalysisResultRepository.findByGithubSearchResultIds(searchResultIds);
        // 4. JobCandProgress 정보 조회
        List<JobCandProgress> progressList = jobCandProgressRepository.findByPostIdAndGithubLoginIn(postId, githubLogins);
        // 5. 후보자 + 분석결과 + 진행상태 매핑
        List<Map<String, Object>> result = candidates.stream().map(c -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("candidate", c);
            aiResults.stream().filter(a -> a.getGithubSearchResultId().equals(c.getGithubSearchResultId())).findFirst().ifPresent(a -> map.put("aiAnalysis", a));
            progressList.stream().filter(p -> p.getGithubLogin().equals(c.getGithubLogin())).findFirst().ifPresent(p -> {
                c.setJobCandCurrStage(p.getJobCandCurrStage());
                map.put("jobCandidateId", p.getJobCandidateId());
            });
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "게시글 ID로 GitHub 검색 결과 조회 (면접 예정자)", description = "특정 채용 공고에 대한 면접 예정자 GitHub 검색 결과를 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "GitHub 검색 결과 목록 반환",
            content = @Content(schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "404", description = "해당 게시글 ID에 대한 검색 결과 없음"),
        @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @GetMapping("/by-post/{postId}/interview-scheduled")
    public ResponseEntity<?> getInterviewScheduledCandidatesByPost(@PathVariable Long postId) {
        // 1. 면접 예정자(3n) githubLogin 리스트 조회
        List<String> githubLogins = jobCandProgressRepository.findGithubLoginsByPostIdAndInterviewScheduledStage(postId);
        if (githubLogins.isEmpty()) return ResponseEntity.ok(List.of());
        // 2. github_search_results에서 후보자 정보 조회
        List<GithubSearchResult> candidates = resultRepo.findByPostIdAndGithubLoginIn(postId, githubLogins);
        // 3. AI 분석 결과 조회
        List<Long> searchResultIds = candidates.stream().map(GithubSearchResult::getGithubSearchResultId).collect(Collectors.toList());
        List<AiAnalysisResult> aiResults = aiAnalysisResultRepository.findByGithubSearchResultIds(searchResultIds);
        // 4. JobCandProgress 정보 조회
        List<JobCandProgress> progressList = jobCandProgressRepository.findByPostIdAndGithubLoginIn(postId, githubLogins);
        // 5. 후보자 + 분석결과 + 진행상태 매핑
        List<Map<String, Object>> result = candidates.stream().map(c -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("candidate", c);
            aiResults.stream().filter(a -> a.getGithubSearchResultId().equals(c.getGithubSearchResultId())).findFirst().ifPresent(a -> map.put("aiAnalysis", a));
            progressList.stream().filter(p -> p.getGithubLogin().equals(c.getGithubLogin())).findFirst().ifPresent(p -> {
                c.setJobCandCurrStage(p.getJobCandCurrStage());
                map.put("jobCandidateId", p.getJobCandidateId());
            });
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "게시글 ID로 GitHub 검색 결과 조회 (면접 완료자)", description = "특정 채용 공고에 대한 면접 완료자 GitHub 검색 결과를 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "GitHub 검색 결과 목록 반환",
            content = @Content(schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "404", description = "해당 게시글 ID에 대한 검색 결과 없음"),
        @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @GetMapping("/by-post/{postId}/interview-completed")
    public ResponseEntity<?> getInterviewCompletedCandidatesByPost(@PathVariable Long postId) {
        // 1. 면접 완료자(3y) githubLogin 리스트 조회
        List<String> githubLogins = jobCandProgressRepository.findGithubLoginsByPostIdAndInterviewCompletedStage(postId);
        if (githubLogins.isEmpty()) return ResponseEntity.ok(List.of());
        // 2. github_search_results에서 후보자 정보 조회
        List<GithubSearchResult> candidates = resultRepo.findByPostIdAndGithubLoginIn(postId, githubLogins);
        // 3. AI 분석 결과 조회
        List<Long> searchResultIds = candidates.stream().map(GithubSearchResult::getGithubSearchResultId).collect(Collectors.toList());
        List<AiAnalysisResult> aiResults = aiAnalysisResultRepository.findByGithubSearchResultIds(searchResultIds);
        // 4. JobCandProgress 정보 조회
        List<JobCandProgress> progressList = jobCandProgressRepository.findByPostIdAndGithubLoginIn(postId, githubLogins);
        // 5. 후보자 + 분석결과 + 진행상태 매핑
        List<Map<String, Object>> result = candidates.stream().map(c -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("candidate", c);
            aiResults.stream().filter(a -> a.getGithubSearchResultId().equals(c.getGithubSearchResultId())).findFirst().ifPresent(a -> map.put("aiAnalysis", a));
            progressList.stream().filter(p -> p.getGithubLogin().equals(c.getGithubLogin())).findFirst().ifPresent(p -> {
                c.setJobCandCurrStage(p.getJobCandCurrStage());
                map.put("jobCandidateId", p.getJobCandidateId());
            });
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

        // 20250626
    @Operation(summary = "job_cand_curr_stage를 조회하기 위함.", description = "")
    @GetMapping("/{postId}/states")
    public List<GithubSearchResultWithStageDto> getSearchResults(@PathVariable Long postId) {
        return githubSearchResultsService.getSearchResultsWithStage(postId);
    }
}
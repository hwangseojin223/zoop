package com.zoop.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zoop.backend.domain.dto.FilterRequestDto;
import com.zoop.backend.domain.dto.GithubSearchResultWithStageDto;
import com.zoop.backend.domain.entity.GithubSearchResult;
import com.zoop.backend.repository.GithubSearchResultRepository;
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
    private final GithubSearchResultService githubSearchResultsService;

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
        System.out.println("🔍 GitHub 후보자 검색 시작: " + dto.getPostId());
        githubBridgeService.fetchFromPythonAndSave(dto);
        return ResponseEntity.ok("✅ FastAPI에서 GitHub 후보자 검색 완료");
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
    
    @Operation(summary = "job_cand_curr_stage를 조회하기 위함.", description = "")
    @GetMapping("/{postId}/states")
    public List<GithubSearchResultWithStageDto> getSearchResults(@PathVariable Long postId) {
        return githubSearchResultsService.getSearchResultsWithStage(postId);
    }
    
}
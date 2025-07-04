package com.zoop.backend.controller;

import com.zoop.backend.domain.dto.AiAnalysisResultDto;
import com.zoop.backend.domain.entity.AiAnalysisResult;
import com.zoop.backend.service.AiAnalysisResultService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "AiAnalysisResultController", description = "AI 분석 결과 관련 API")
@RestController
@RequestMapping("/api/ai-analysis-results")
@RequiredArgsConstructor
public class AiAnalysisResultController {

    private final AiAnalysisResultService aiAnalysisResultService;

    @GetMapping
    public ResponseEntity<List<AiAnalysisResult>> getAllAiAnalysisResults() {
        // 모든 AI 분석 결과 조회
        List<AiAnalysisResult> results = aiAnalysisResultService.findAll();
        return ResponseEntity.ok(results);
    }

    @Operation(summary = "AI 분석 결과 저장", description = "GitHub 후보자에 대한 AI 분석 결과를 저장합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "AI 분석 결과 저장 성공",
            content = @Content(schema = @Schema(implementation = AiAnalysisResult.class))),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @PostMapping
    public ResponseEntity<AiAnalysisResult> saveAiAnalysisResult(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "AI 분석 결과 저장을 위한 데이터",
            required = true,
            content = @Content(schema = @Schema(implementation = AiAnalysisResultDto.class))
        )
        @RequestBody AiAnalysisResultDto dto) {
        
        AiAnalysisResult saved = aiAnalysisResultService.saveAiAnalysisResult(dto);
        return ResponseEntity.status(201).body(saved);
    }

    @Operation(summary = "GitHub 검색 결과 ID로 AI 분석 결과 조회", description = "특정 GitHub 검색 결과에 대한 AI 분석 결과를 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "AI 분석 결과 반환",
            content = @Content(schema = @Schema(implementation = AiAnalysisResult.class))),
        @ApiResponse(responseCode = "404", description = "AI 분석 결과 없음")
    })
    @GetMapping("/github/{githubSearchResultId}")
    public ResponseEntity<AiAnalysisResult> getByGithubSearchResultId(
        @Parameter(description = "GitHub 검색 결과 ID", required = true, example = "1")
        @PathVariable Long githubSearchResultId) {
        
        return aiAnalysisResultService.findByGithubSearchResultId(githubSearchResultId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "게시글 ID로 AI 분석 결과 목록 조회", description = "특정 채용 공고에 대한 모든 AI 분석 결과를 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "AI 분석 결과 목록 반환",
            content = @Content(schema = @Schema(implementation = AiAnalysisResult.class)))
    })
    @GetMapping("/post/{postId}")
    public ResponseEntity<List<AiAnalysisResult>> getByPostId(
        @Parameter(description = "게시글 ID", required = true, example = "1")
        @PathVariable Long postId) {
        
        List<AiAnalysisResult> results = aiAnalysisResultService.findByPostId(postId);
        return ResponseEntity.ok(results);
    }

    @Operation(summary = "분석 타입으로 AI 분석 결과 목록 조회", description = "특정 분석 타입의 AI 분석 결과를 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "AI 분석 결과 목록 반환",
            content = @Content(schema = @Schema(implementation = AiAnalysisResult.class)))
    })
    @GetMapping("/type/{analysisType}")
    public ResponseEntity<List<AiAnalysisResult>> getByAnalysisType(
        @Parameter(description = "분석 타입 (github, portfolio, interview)", required = true, example = "github")
        @PathVariable String analysisType) {
        
        List<AiAnalysisResult> results = aiAnalysisResultService.findByAnalysisType(analysisType);
        return ResponseEntity.ok(results);
    }
} 
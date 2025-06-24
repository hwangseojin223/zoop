package com.zoop.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zoop.backend.domain.dto.PostingRequestDto;
import com.zoop.backend.domain.entity.Post;
import com.zoop.backend.service.PostService;
import com.zoop.backend.util.JwtUtil;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "RecruitPostingControlller", description = "채용 공고 관련 API")
@RestController
@RequestMapping("/api/postings")
@RequiredArgsConstructor
public class RecruitPostingController {

    private final PostService postService;
    private final JwtUtil jwtUtil; // ✅ 추가됨

    @Operation(summary = "새 채용 공고 생성", description = "인증된 사용자가 새로운 채용 공고를 등록합니다.")
    @ApiResponses(value={
        @ApiResponse(responseCode = "200", description = "채용 공고 등록 성공 및 생성된 공고의 ID 반환",
            content = @Content(schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 (필수 데이터 누락, 형식 오류 등)"),
        @ApiResponse(responseCode = "401", description = "인증 실패 (유효하지 않거나 누락된 JWT)"),
        @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @PostMapping
    public ResponseEntity<Map<String, Object>> createPost(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "새 채용 공고 생성을 위한 정보",
            required = true,
            content=@Content(schema = @Schema(implementation = PostingRequestDto.class))
        )
        @RequestBody PostingRequestDto dto,
        @Parameter(description = "JWT 인증 토큰(Bearer prefix 포함)", required = true, example = "Bearer eyJhbGZci0i...")
        @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.replace("Bearer ", "");
        String loginId = jwtUtil.getLoginIdFromToken(token); // ✅ 정적 호출 ❌ → 인스턴스 호출 ✅
        Post post = postService.createPost(dto, loginId);
        return ResponseEntity.ok(Map.of("postId", post.getPostId()));
    }
}

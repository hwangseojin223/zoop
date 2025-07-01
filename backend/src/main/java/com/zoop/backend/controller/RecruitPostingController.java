package com.zoop.backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class RecruitPostingController {

    private final PostService postService;
    private final JwtUtil jwtUtil;

    @Operation(summary = "공고 정보 조회", description = "공고 ID로 공고 정보를 조회합니다.")
    @ApiResponses(value={
        @ApiResponse(responseCode = "200", description = "공고 정보 조회 성공"),
        @ApiResponse(responseCode = "404", description = "공고를 찾을 수 없음"),
        @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @GetMapping("/{postId}")
    public ResponseEntity<Map<String, Object>> getPost(
        @Parameter(description = "공고 ID", required = true)
        @PathVariable Long postId
    ) {
        Post post = postService.getPostById(postId);
        if (post == null) {
            return ResponseEntity.notFound().build();
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("postId", post.getPostId());
        response.put("postTitle", post.getPostTitle());
        response.put("postDescription", post.getPostDescription());
        response.put("postProgrammingLanguage", post.getPostProgrammingLanguage());
        response.put("postLocation", post.getPostLocation());
        response.put("postHeadcount", post.getPostHeadcount());
        response.put("postSalaryStart", post.getPostSalaryStart());
        response.put("postSalaryEnd", post.getPostSalaryEnd());
        response.put("postPostedDate", post.getPostPostedDate());
        response.put("postExpiryDate", post.getPostExpiryDate());
        response.put("postStatus", post.getPostStatus());
        response.put("companyName", post.getCompany() != null ? post.getCompany().getCompanyName() : "정보 없음");
        
        return ResponseEntity.ok(response);
    }

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
        String loginId = jwtUtil.getLoginIdFromToken(token);
        Post post = postService.createPost(dto, loginId);
        return ResponseEntity.ok(Map.of("postId", post.getPostId()));
    }
}

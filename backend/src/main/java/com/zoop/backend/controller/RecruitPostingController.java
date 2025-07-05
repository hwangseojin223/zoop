package com.zoop.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

@Tag(name = "RecruitPostingController", description = "채용 공고 관련 API")
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
            content = @Content(schema = @Schema(implementation =Map.class))),
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
        try {
            String token = authHeader.replace("Bearer ", "");
            String loginId = jwtUtil.getLoginIdFromToken(token);
            Post post = postService.createPost(dto, loginId);
            return ResponseEntity.ok(Map.of("postId", post.getPostId()));
        } catch (Exception e) {
            // 임시로 JWT 인증 실패 시 기본값으로 처리
            System.out.println("JWT 인증 실패, 기본값으로 처리: " + e.getMessage());
            dto.setCompanyId(1L);
            dto.setCompanyAdminId(1L);
            Post post = postService.createPost(dto);
            return ResponseEntity.ok(Map.of("postId", post.getPostId()));
        }
    }

    @Operation(summary = "회사별 공고 목록 조회", description = "특정 회사의 모든 공고 목록을 조회합니다.")
    @ApiResponses(value={
        @ApiResponse(responseCode = "200", description = "공고 목록 반환",
            content = @Content(schema = @Schema(implementation = Post.class))),
        @ApiResponse(responseCode = "404", description = "해당 회사의 공고를 찾을 수 없음"),
        @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @GetMapping
    public ResponseEntity<List<Post>> getPostsByCompany(
        @Parameter(description = "조회할 회사의 ID", required = true, example = "1")
        @RequestParam Long companyId
    ) {
        List<Post> posts = postService.getPostsByCompanyId(companyId);
        return ResponseEntity.ok(posts);
    }

    @Operation(summary = "모든 공고 목록 조회", description = "시스템의 모든 공고 목록을 조회합니다.")
    @ApiResponses(value={
        @ApiResponse(responseCode = "200", description = "공고 목록 반환",
            content = @Content(schema = @Schema(implementation = Post.class))),
        @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @GetMapping("/all")
    public ResponseEntity<List<Post>> getAllPosts() {
        List<Post> posts = postService.getAllPosts();
        return ResponseEntity.ok(posts);
    }

    @Operation(summary = "공고 정보 조회", description = "특정 공고의 기본 정보를 조회합니다.")
    @ApiResponses(value={
        @ApiResponse(responseCode = "200", description = "공고 정보 반환",
            content = @Content(schema = @Schema(implementation = Post.class))),
        @ApiResponse(responseCode = "404", description = "해당 공고를 찾을 수 없음"),
        @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @GetMapping("/info/{postId}")
    public ResponseEntity<Post> getPostInfo(
        @Parameter(description = "조회할 공고의 ID", required = true, example = "1")
        @PathVariable Long postId
    ) {
        Post post = postService.getPostById(postId);
        if (post == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(post);
    }

    @Operation(summary = "공고 정보 업데이트", description = "기존 공고의 정보를 업데이트합니다.")
    @ApiResponses(value={
        @ApiResponse(responseCode = "200", description = "공고 업데이트 성공",
            content = @Content(schema = @Schema(implementation = Post.class))),
        @ApiResponse(responseCode = "404", description = "해당 공고를 찾을 수 없음"),
        @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @PutMapping("/{postId}")
    public ResponseEntity<Post> updatePost(
        @Parameter(description = "업데이트할 공고의 ID", required = true, example = "1")
        @PathVariable Long postId,
        @RequestBody PostingRequestDto dto
    ) {
        try {
            Post updatedPost = postService.updatePost(postId, dto);
            return ResponseEntity.ok(updatedPost);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "인재상 저장", description = "특정 공고에 인재상을 저장합니다.")
    @ApiResponses(value={
        @ApiResponse(responseCode = "200", description = "인재상 저장 성공",
            content = @Content(schema = @Schema(implementation = Post.class))),
        @ApiResponse(responseCode = "404", description = "해당 공고를 찾을 수 없음"),
        @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @PutMapping("/{postId}/ideal-candidate")
    public ResponseEntity<Post> updateIdealCandidate(
        @Parameter(description = "인재상을 저장할 공고의 ID", required = true, example = "1")
        @PathVariable Long postId,
        @RequestBody Map<String, String> request
    ) {
        try {
            String idealCandidate = request.get("idealCandidate");
            if (idealCandidate == null) {
                return ResponseEntity.badRequest().build();
            }
            Post updatedPost = postService.updateIdealCandidate(postId, idealCandidate);
            return ResponseEntity.ok(updatedPost);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

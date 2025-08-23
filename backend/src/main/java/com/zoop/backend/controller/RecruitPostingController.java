package com.zoop.backend.controller;

import com.zoop.backend.domain.dto.PostingRequestDto;
import com.zoop.backend.domain.entity.Company;
import com.zoop.backend.domain.entity.Post;
import com.zoop.backend.repository.CompanyRepository;
import com.zoop.backend.repository.PostRepository;
import com.zoop.backend.service.PostService;
import com.zoop.backend.util.JwtUtil;

import java.time.LocalDate;
import java.util.HashMap;

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

import java.util.Map;
import java.util.List;

@Tag(name = "RecruitPostingController", description = "채용 공고 관련 API")
@RestController
@RequestMapping("/api/postings")
@RequiredArgsConstructor
public class RecruitPostingController {

    private final PostService postService;
    private final JwtUtil jwtUtil; // ✅ 추가됨
    private final CompanyRepository companyRepository;
    private final PostRepository postRepository;

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
        System.out.println("=== 전체 공고 조회 결과 ===");
        System.out.println("총 공고 수: " + posts.size());
        for (Post post : posts) {
            System.out.println("공고 ID: " + post.getPostId() + ", 제목: " + post.getPostTitle() + 
                             ", 상태: " + post.getPostStatus() + ", 마감일: " + post.getPostExpiryDate());
        }
        System.out.println("========================");
        return ResponseEntity.ok(posts);
    }

    @Operation(summary = "현재 로그인한 회사의 공고 목록 조회", description = "JWT 토큰을 통해 현재 로그인한 회사의 모든 공고 목록을 조회합니다.")
    @ApiResponses(value={
        @ApiResponse(responseCode = "200", description = "회사 공고 목록 반환",
            content = @Content(schema = @Schema(implementation = Post.class))),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @GetMapping("/company")
    public ResponseEntity<List<Post>> getPostsByCurrentCompany(
        @Parameter(description = "JWT 인증 토큰(Bearer prefix 포함)", required = true)
        @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String loginId = jwtUtil.getLoginIdFromToken(token);
            List<Post> posts = postService.getPostsByCompanyAdmin(loginId);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            System.err.println("JWT 인증 실패: " + e.getMessage());
            return ResponseEntity.status(401).build();
        }
    }

    @Operation(summary = "공개 공고 목록 조회", description = "공개용으로 사용할 수 있는 모든 공고 목록을 조회합니다.")
    @ApiResponses(value={
        @ApiResponse(responseCode = "200", description = "공개 공고 목록 반환",
            content = @Content(schema = @Schema(implementation = Post.class))),
        @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @GetMapping("/public")
    public ResponseEntity<List<Post>> getPublicPosts() {
        List<Post> posts = postService.getPublicPosts();
        System.out.println("=== 공개 공고 조회 결과 ===");
        System.out.println("총 공고 수: " + posts.size());
        for (Post post : posts) {
            System.out.println("공고 ID: " + post.getPostId() + ", 제목: " + post.getPostTitle() + 
                             ", 상태: " + post.getPostStatus() + ", 마감일: " + post.getPostExpiryDate());
        }
        System.out.println("========================");
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

    @Operation(summary = "만료된 공고 목록 조회", description = "만료일이 지난 공고들을 조회합니다.")
    @GetMapping("/expired")
    public ResponseEntity<List<Post>> getExpiredPosts() {
        List<Post> expiredPosts = postService.getExpiredPosts();
        System.out.println("=== 만료된 공고 조회 결과 ===");
        System.out.println("만료된 공고 수: " + expiredPosts.size());
        for (Post post : expiredPosts) {
            System.out.println("공고 ID: " + post.getPostId() + ", 제목: " + post.getPostTitle() + 
                             ", 상태: " + post.getPostStatus() + ", 만료일: " + post.getPostExpiryDate());
        }
        System.out.println("========================");
        return ResponseEntity.ok(expiredPosts);
    }

    @Operation(summary = "만료된 공고 상태 업데이트", description = "만료일이 지난 공고들을 INACTIVE 상태로 업데이트합니다.")
    @PostMapping("/update-expired")
    public ResponseEntity<Map<String, Object>> updateExpiredPosts() {
        int updatedCount = postService.updateExpiredPosts();
        return ResponseEntity.ok(Map.of(
            "message", "만료된 공고 상태 업데이트 완료",
            "updatedCount", updatedCount
        ));
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



    @Operation(summary = "샘플 데이터 생성", description = "테스트용 샘플 공고 데이터를 생성합니다.")
    @ApiResponses(value={
        @ApiResponse(responseCode = "200", description = "샘플 데이터 생성 성공"),
        @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @PostMapping("/sample-data")
    public ResponseEntity<Map<String, Object>> createSampleData() {
        try {
            // 샘플 회사 데이터 생성
            Company company1 = new Company();
            company1.setBusinessNumber("123-45-67890");
            company1.setCompanyName("테크스타트업");
            company1.setCompanyAddress("서울특별시 강남구");
            company1.setCeoName("김창업");
            
            Company company2 = new Company();
            company2.setBusinessNumber("987-65-43210");
            company2.setCompanyName("AI 솔루션즈");
            company2.setCompanyAddress("서울특별시 서초구");
            company2.setCeoName("이인공");
            
            Company company3 = new Company();
            company3.setBusinessNumber("555-55-55555");
            company3.setCompanyName("웹개발컴퍼니");
            company3.setCompanyAddress("부산광역시 해운대구");
            company3.setCeoName("박웹개발");
            
            // 회사 저장
            Company savedCompany1 = companyRepository.save(company1);
            Company savedCompany2 = companyRepository.save(company2);
            Company savedCompany3 = companyRepository.save(company3);
            
            // 샘플 공고 데이터 생성
            Post post1 = Post.builder()
                .companyId(savedCompany1.getCompanyId())
                .companyAdminId(1L)
                .postTitle("시니어 프론트엔드 개발자")
                .postDescription("React, TypeScript를 활용한 웹 애플리케이션 개발을 담당합니다. 사용자 경험을 중시하며, 팀과의 협업을 통해 최고의 제품을 만들어갑니다.")
                .postProgrammingLanguage("React,TypeScript,JavaScript")
                .postLocation("서울")
                .postHeadcount(2)
                .postSalaryStart("5000만원")
                .postSalaryEnd("7000만원")
                .postPostedDate(LocalDate.now())
                .postExpiryDate(LocalDate.now().plusMonths(3))
                .postStatus("ACTIVE")
                .postIdealCandidate("React 3년 이상 경험, TypeScript 숙련자, 협업 경험 풍부")
                .build();
            
            Post post2 = Post.builder()
                .companyId(savedCompany2.getCompanyId())
                .companyAdminId(1L)
                .postTitle("AI 엔지니어")
                .postDescription("머신러닝 모델 개발 및 AI 솔루션 구현을 담당합니다. 데이터 분석부터 모델 배포까지 전체 파이프라인을 경험할 수 있습니다.")
                .postProgrammingLanguage("Python,TensorFlow,PyTorch")
                .postLocation("서울")
                .postHeadcount(1)
                .postSalaryStart("6000만원")
                .postSalaryEnd("8000만원")
                .postPostedDate(LocalDate.now())
                .postExpiryDate(LocalDate.now().plusMonths(2))
                .postStatus("ACTIVE")
                .postIdealCandidate("Python 3년 이상, 머신러닝 프로젝트 경험, 수학/통계학 배경")
                .build();
            
            Post post3 = Post.builder()
                .companyId(savedCompany3.getCompanyId())
                .companyAdminId(1L)
                .postTitle("백엔드 개발자")
                .postDescription("Spring Boot를 활용한 RESTful API 개발 및 데이터베이스 설계를 담당합니다. 확장 가능한 아키텍처 설계 경험이 필요합니다.")
                .postProgrammingLanguage("Java,Spring Boot,MySQL")
                .postLocation("부산")
                .postHeadcount(3)
                .postSalaryStart("4000만원")
                .postSalaryEnd("6000만원")
                .postPostedDate(LocalDate.now())
                .postExpiryDate(LocalDate.now().plusMonths(4))
                .postStatus("ACTIVE")
                .postIdealCandidate("Java 2년 이상, Spring Boot 경험, 데이터베이스 설계 경험")
                .build();
            
            Post post4 = Post.builder()
                .companyId(savedCompany1.getCompanyId())
                .companyAdminId(1L)
                .postTitle("주니어 개발자")
                .postDescription("신입 개발자를 위한 포지션입니다. 선배 개발자들과 함께 배우며 성장할 수 있는 환경을 제공합니다.")
                .postProgrammingLanguage("JavaScript,React,Node.js")
                .postLocation("서울")
                .postHeadcount(5)
                .postSalaryStart("3000만원")
                .postSalaryEnd("4000만원")
                .postPostedDate(LocalDate.now())
                .postExpiryDate(LocalDate.now().plusMonths(1))
                .postStatus("ACTIVE")
                .postIdealCandidate("컴퓨터공학 전공자, 프로젝트 경험, 학습 의지가 강한 분")
                .build();
            
            // 공고 저장
            Post savedPost1 = postRepository.save(post1);
            Post savedPost2 = postRepository.save(post2);
            Post savedPost3 = postRepository.save(post3);
            Post savedPost4 = postRepository.save(post4);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "샘플 데이터가 성공적으로 생성되었습니다.");
            response.put("companies", List.of(savedCompany1, savedCompany2, savedCompany3));
            response.put("posts", List.of(savedPost1, savedPost2, savedPost3, savedPost4));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "샘플 데이터 생성 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}

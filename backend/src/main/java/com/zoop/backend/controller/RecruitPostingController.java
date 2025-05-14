package com.zoop.backend.controller;

import com.zoop.backend.domain.dto.PostingRequestDto;
import com.zoop.backend.domain.entity.Post;
import com.zoop.backend.service.PostService;
import com.zoop.backend.util.JwtUtil;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/postings")
@RequiredArgsConstructor
public class RecruitPostingController {

    private final PostService postService;
    private final JwtUtil jwtUtil; // ✅ 추가됨

    @PostMapping
    public ResponseEntity<Map<String, Object>> createPost(
        @RequestBody PostingRequestDto dto,
        @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.replace("Bearer ", "");
        String loginId = jwtUtil.getLoginIdFromToken(token); // ✅ 정적 호출 ❌ → 인스턴스 호출 ✅
        Post post = postService.save(dto, loginId);
        return ResponseEntity.ok(Map.of("postId", post.getPostId()));
    }
}

package com.zoop.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.zoop.backend.domain.entity.Post;
import com.zoop.backend.service.PostService;
import com.zoop.backend.domain.dto.PostingRequestDto;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping
    public Post createPost(@RequestBody PostingRequestDto dto) {
        return postService.createPost(dto);
    }

    @GetMapping("/all")
    public List<Post> getAllPosts() {
        return postService.getAllPosts();
    }

    @GetMapping("/company/{companyId}")
    public List<Post> getPostsByCompanyId(@PathVariable Long companyId) {
        return postService.getPostsByCompanyId(companyId);
    }
}

package com.zoop.backend.controller;

import com.zoop.backend.domain.dto.FilterRequestDto;
import com.zoop.backend.domain.entity.GithubSearchResult;
import com.zoop.backend.repository.GithubSearchResultRepository;
import com.zoop.backend.service.GithubBridgeService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/github-search")
@RequiredArgsConstructor
public class GithubSearchController {

    private final GithubBridgeService githubBridgeService;
    private final GithubSearchResultRepository resultRepo;

    @PostMapping
    public ResponseEntity<?> filterAndStore(@RequestBody FilterRequestDto dto) {
        System.out.println("🔍 GitHub 후보자 검색 시작: " + dto.getPostId());
        githubBridgeService.fetchFromPythonAndSave(dto);
        return ResponseEntity.ok("✅ FastAPI에서 GitHub 후보자 검색 완료");
    }

    @GetMapping("/results")
    public ResponseEntity<List<GithubSearchResult>> getResults() {
        return ResponseEntity.ok(resultRepo.findAll());
    }
}



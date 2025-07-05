package com.zoop.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zoop.backend.domain.dto.ResponderDto;
import com.zoop.backend.service.JobCandProgressService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/responder")
@RequiredArgsConstructor
public class JobCandProgressController {

    private final JobCandProgressService jobCandProgressService;

    // @GetMapping
    // public ResponseEntity<List<JobCandProgress>> getAllProgresses() {
    //     return ResponseEntity.ok(jobCandProgressService.getAllProgresses());
    // }

    // URL 예시: /api/post/1
    @GetMapping("/stage2y/{postId}")
    public List<ResponderDto> getCandidatesAtStage2yByPost(@PathVariable Long postId) {
        System.out.println("2y 스테이지 후보자 조회 API 호출: " + postId);
        List<ResponderDto> list = jobCandProgressService.getCandidatesAtStage2yByPost(postId);
        System.out.println("API 응답 후보자 수: " + list.size());
        return list;
    }
}

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
    @GetMapping("{postId}")
    public List<ResponderDto> getCandidatesAtStage3nByPost(@PathVariable Long postId) {
        System.out.println("Controller: 요청 들어옴, postId=" + postId);
        List<ResponderDto> list = jobCandProgressService.getCandidatesAtStage3nByPost(postId);
        System.out.println("리스트 크기 : " + list.size());

        return list;
    }
}

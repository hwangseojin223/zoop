package com.zoop.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zoop.backend.domain.entity.Candidate;
import com.zoop.backend.service.CandidateService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("auth/applicant/signup")
@RequiredArgsConstructor
public class CandidateController {

    private final CandidateService candidateService;

    // // 모든 후보자 리스트 조회
    // @GetMapping
    // public ResponseEntity<List<Candidate>> getAllCandidates() {
    //     List<Candidate> candidates = candidateService.findAll();
    //     if (candidates.isEmpty()) {
    //         return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 데이터가 없으면 204 상태 코드
    //     }
    //     return new ResponseEntity<>(candidates, HttpStatus.OK); // 200 상태 코드
    // }

    // 후보자 추가
    @PostMapping("/process")
    public ResponseEntity<Candidate> addCandidate(@RequestBody Candidate candidate) {
        // 입력받은 candidate 정보 출력
        System.out.println(candidate.toString());
        
        // 후보자 저장
        Candidate savedCandidate = candidateService.save(candidate);
        
        // 저장된 후보자와 함께 201 CREATED 상태 코드 반환
        return new ResponseEntity<>(savedCandidate, HttpStatus.CREATED);
    }
}

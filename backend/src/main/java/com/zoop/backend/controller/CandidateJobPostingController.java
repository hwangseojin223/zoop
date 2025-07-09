package com.zoop.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zoop.backend.domain.dto.JobPostingResponseDto;
import com.zoop.backend.service.CandidateJobPostingService;
/**
 *
 * @author hwangseojin
 */

@RestController // RESTful 웹 서비스 컨트롤러임을 나타냅니다.
@RequestMapping("/api/candidates/{candidateId}") // 기본 URL 경로 설정
public class CandidateJobPostingController {
    private final CandidateJobPostingService candidateJobPostingService;

    @Autowired
    public CandidateJobPostingController(CandidateJobPostingService candidateJobPostingService) {
        this.candidateJobPostingService = candidateJobPostingService;
    }

    @GetMapping("/job-postings") // GET 요청에 대한 하위 경로 설정
    public ResponseEntity<List<JobPostingResponseDto>> getJobPostingsForCandidate(
            @PathVariable("candidateId") Long candidateId) { // URL 경로에서 candidateId 값을 가져옵니다.
        // Long 타입의 candidateId를 Integer로 변환
        Integer candidateIdInt = candidateId.intValue(); 
        

        // Service 계층의 메서드를 호출하여 공고 목록 데이터를 가져옵니다.
        List<JobPostingResponseDto> jobPostings = candidateJobPostingService.getJobPostingsForCandidate(candidateIdInt);

        // HTTP 응답으로 데이터와 함께 상태 코드 200 (OK)를 반환합니다.
        return ResponseEntity.ok(jobPostings);
    }
}

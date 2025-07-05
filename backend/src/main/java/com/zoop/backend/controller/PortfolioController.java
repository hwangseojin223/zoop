package com.zoop.backend.controller;

import com.zoop.backend.domain.dto.FilePathResponse;
import com.zoop.backend.domain.dto.modal.PortfolioSubmissionDateResponse;
import com.zoop.backend.service.PortfolioService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/portfolios")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;

    @GetMapping("/{jobCandId}/file-path")
    public FilePathResponse getFilePath(@PathVariable Long jobCandId) {
        String path = portfolioService.getFilePathByJobCandId(jobCandId);
        return new FilePathResponse(path);
    }

    /** 합친 이후 */
    @GetMapping("/{jobCandidateId}/submission-date")
    public ResponseEntity<?> getPortfolioSubmissionDate(@PathVariable Long jobCandidateId) {
        return portfolioService.getSubmissionDate(jobCandidateId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body("해당 후보자의 포트폴리오가 존재하지 않습니다."));
    }

}

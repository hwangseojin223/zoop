package com.zoop.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zoop.backend.domain.dto.AdminInterviewEvaluationDto;
import com.zoop.backend.service.AdminInterviewEvaluationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin-interview-evaluations")
@RequiredArgsConstructor
public class AdminInterviewEvaluationController {

    private final AdminInterviewEvaluationService adminInterviewEvaluationService;

    @PostMapping
    public ResponseEntity<AdminInterviewEvaluationDto> saveEvaluation(@RequestBody AdminInterviewEvaluationDto evaluationDto) {
        try {
            AdminInterviewEvaluationDto savedEvaluation = adminInterviewEvaluationService.saveEvaluation(evaluationDto);
            return ResponseEntity.ok(savedEvaluation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{jobCandidateId}")
    public ResponseEntity<AdminInterviewEvaluationDto> getEvaluationByJobCandidateId(@PathVariable Long jobCandidateId) {
        try {
            return adminInterviewEvaluationService.getEvaluationByJobCandidateId(jobCandidateId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 
package com.zoop.backend.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.zoop.backend.domain.dto.modal.InterviewAnalysisResponse;
import com.zoop.backend.domain.dto.modal.PortfolioAnalysisResponse;
import com.zoop.backend.domain.entity.AiAnalysisResults;
import com.zoop.backend.repository.AiAnalysisResultRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AiAnalysisService {

    private final AiAnalysisResultRepository repository;

    // 포트폴리오분석,점수 조회
    public PortfolioAnalysisResponse getPortfolioAnalysis(Long jobCandidateId) {
        AiAnalysisResults result = repository.findByJobCandidateIdAndAnalysisType(jobCandidateId, "portfolio")
            .orElseThrow(() -> new IllegalArgumentException("해당 후보자의 포트폴리오 분석 결과가 없습니다."));
        return new PortfolioAnalysisResponse(result.getAnalysisData(), result.getAnalysisScore());
    }

    // AI면접 내용, 점수 조회;
    public Optional<InterviewAnalysisResponse> getInterviewAnalysis(Long jobCandidateId) {
        return repository.findByJobCandidateIdAndAnalysisType(jobCandidateId, "interview")
                .map(r -> new InterviewAnalysisResponse(r.getAnalysisData(), r.getAnalysisScore()));
    }
}


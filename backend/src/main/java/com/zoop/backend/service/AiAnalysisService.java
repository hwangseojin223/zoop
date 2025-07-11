package com.zoop.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.zoop.backend.domain.dto.modal.InterviewAnalysisResponse;
import com.zoop.backend.domain.dto.modal.PortfolioAnalysisResponse;
import com.zoop.backend.domain.entity.AiAnalysisResult;
import com.zoop.backend.repository.AiAnalysisResultRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AiAnalysisService {

    private final AiAnalysisResultRepository repository;

    // 포트폴리오분석,점수 조회
    public PortfolioAnalysisResponse getPortfolioAnalysis(Long jobCandidateId) {
        List<AiAnalysisResult> results = repository.findByJobCandidateIdAndAnalysisType(jobCandidateId, "portfolio");
        
        if (!results.isEmpty()) {
            AiAnalysisResult analysis = results.get(0);
            return new PortfolioAnalysisResponse(
                analysis.getAnalysisData(),
                analysis.getAnalysisScore()
            );
        }
        
        // 분석 결과가 없는 경우 기본값 반환
        return new PortfolioAnalysisResponse("포트폴리오 분석 결과가 없습니다.", 0.0);
    }

    // AI면접 내용, 점수 조회;
    public Optional<InterviewAnalysisResponse> getInterviewAnalysis(Long jobCandidateId) {
        List<AiAnalysisResult> results = repository.findByJobCandidateIdAndAnalysisType(jobCandidateId, "interview");
        
        if (!results.isEmpty()) {
            AiAnalysisResult analysis = results.get(0);
            return Optional.of(new InterviewAnalysisResponse(
                analysis.getAnalysisData(),
                analysis.getAnalysisScore()
            ));
        }
        
        return Optional.empty();
    }
}


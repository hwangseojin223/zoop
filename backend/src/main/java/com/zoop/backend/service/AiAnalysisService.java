package com.zoop.backend.service;

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
        Optional<AiAnalysisResult> result = repository.findByJobCandidateIdAndAnalysisType(jobCandidateId, "portfolio");
        
        if (result.isPresent()) {
            AiAnalysisResult analysis = result.get();
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
        Optional<AiAnalysisResult> result = repository.findByJobCandidateIdAndAnalysisType(jobCandidateId, "interview");
        
        if (result.isPresent()) {
            AiAnalysisResult analysis = result.get();
            return Optional.of(new InterviewAnalysisResponse(
                analysis.getAnalysisData(),
                analysis.getAnalysisScore()
            ));
        }
        
        return Optional.empty();
    }
}


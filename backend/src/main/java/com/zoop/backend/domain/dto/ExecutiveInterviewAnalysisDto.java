package com.zoop.backend.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExecutiveInterviewAnalysisDto {
    
    private Long jobCandidateId;
    private Long postId;
    private String analysisData;  // JSON 형태의 분석 결과
    private Double analysisScore;  // AI 분석 점수
    private String recommendation;  // 합격/불합격 추천
} 
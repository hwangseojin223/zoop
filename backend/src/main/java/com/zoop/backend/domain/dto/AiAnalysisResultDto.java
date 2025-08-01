package com.zoop.backend.domain.dto;

import java.time.LocalDateTime;

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
public class AiAnalysisResultDto {

    private Long analysisId;
    private String analysisType;
    private Long githubSearchResultId;
    private Long jobCandidateId;
    private Long candPortfolioId;
    private String analysisData;
    private Double analysisScore;
    private LocalDateTime analysisDate;
    private LocalDateTime analysisCreatedAt;
} 
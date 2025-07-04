package com.zoop.backend.domain.dto;

import lombok.*;

import java.time.LocalDateTime;

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
    private String analysisData;
    private Double analysisScore;
    private LocalDateTime analysisDate;
    private LocalDateTime analysisCreatedAt;
} 
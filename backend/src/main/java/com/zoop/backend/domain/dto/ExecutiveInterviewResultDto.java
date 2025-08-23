package com.zoop.backend.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExecutiveInterviewResultDto {
    
    private Long resultId;
    private Long scheduleId;
    private BigDecimal evaluationScore;
    private String evaluationNotes;
    private String finalDecision; // 'PASS', 'FAIL'
    private LocalDateTime createdAt;
    
    // 추가 정보
    private String candidateName;
    private String postTitle;
    private String interviewDate;
    private String aiAnalysisResult;
} 
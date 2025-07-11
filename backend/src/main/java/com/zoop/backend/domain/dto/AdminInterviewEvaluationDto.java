package com.zoop.backend.domain.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminInterviewEvaluationDto {
    private Long adminIntrvwEvalId;
    private Long jobCandidateId;
    private Long evaluatedByAdminId;
    private LocalDateTime adminIntrvwEvaluationDate;
    private BigDecimal adminIntrvwScore;
    private String adminIntrvwNotes;
    private String adminIntrvwSlctStatus;
    private LocalDateTime adminIntrvwCreatedAt;
} 
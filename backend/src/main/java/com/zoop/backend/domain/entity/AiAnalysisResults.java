package com.zoop.backend.domain.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ai_analysis_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiAnalysisResults {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "analysis_seq")
    @SequenceGenerator(
        name = "analysis_seq",
        sequenceName = "ANALYSIS_SEQ", // 실제 시퀀스 이름과 일치시켜야 함
        allocationSize = 1
    )
    @Column(name = "analysis_id")
    private Long analysisId;

    @Column(name = "analysis_type", nullable = false, length = 50)
    private String analysisType;

    @Column(name = "github_search_result_id")
    private Long githubSearchResultId;

    @Column(name = "job_candidate_id")
    private Long jobCandidateId;

    @Lob
    @Column(name = "analysis_data", nullable = false)
    private String analysisData;

    @Column(name = "analysis_score")
    private Double analysisScore;

    @Column(name = "analysis_date")
    private LocalDateTime analysisDate;

    @Column(name = "analysis_created_at")
    private LocalDateTime analysisCreatedAt;
}

package com.zoop.backend.domain.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
public class AiAnalysisResult {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "aar_seq_gen")
    @SequenceGenerator(name = "aar_seq_gen", sequenceName = "AI_ANALYSIS_RESULTS_SEQ", allocationSize = 1)
    @Column(name = "analysis_id")
    private Long analysisId;

    @Column(name = "analysis_type", nullable = false)
    @JsonProperty("analysisType")
    private String analysisType;

    @Column(name = "github_search_result_id")
    @JsonProperty("githubSearchResultId")
    private Long githubSearchResultId;

    @Column(name = "job_candidate_id")
    @JsonProperty("jobCandidateId")
    private Long jobCandidateId;

    @Column(name = "cand_portfolio_id")
    private Long candPortfolioId;

    @Column(name = "analysis_data", columnDefinition = "CLOB", nullable = false)
    @JsonProperty("analysisData")
    private String analysisData;

    @Column(name = "analysis_score")
    @JsonProperty("analysisScore")
    private Double analysisScore;

    @Column(name = "analysis_date", nullable = false)
    @JsonProperty("analysisDate")
    private LocalDateTime analysisDate;

    @Column(name = "analysis_created_at", nullable = false)
    @JsonProperty("analysisCreatedAt")
    private LocalDateTime analysisCreatedAt;

    // GitHub 검색 결과와의 관계 (선택적)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "github_search_result_id", insertable = false, updatable = false)
    @JsonIgnore
    private GithubSearchResult githubSearchResult;
} 
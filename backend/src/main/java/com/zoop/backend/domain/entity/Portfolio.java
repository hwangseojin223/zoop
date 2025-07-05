package com.zoop.backend.domain.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "PORTFOLIOS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PORTFOLIO_ID")
    private Long portfolioId;

    @Column(name = "JOB_CANDIDATE_ID", nullable = false)
    private Long jobCandidateId;

    @Column(name = "PORTFOLIO_SUBMISSION_DATE")
    private LocalDateTime portfolioSubmissionDate;

    @Column(name = "PORTFOLIO_FILE_PATH")
    private String portfolioFilePath;

    @Lob
    @Column(name = "PORTFOLIO_CONTENT")
    private String portfolioContent;

    @Column(name = "PORTFOLIO_URL")
    private String portfolioUrl;

    @Column(name = "PORTFOLIO_CREATED_AT", nullable = false)
    private LocalDateTime portfolioCreatedAt;

    @Column(name = "PORTFOLIO_UPDATED_AT", nullable = false)
    private LocalDateTime portfolioUpdatedAt;
}

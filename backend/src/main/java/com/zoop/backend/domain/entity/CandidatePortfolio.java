package com.zoop.backend.domain.entity;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "candidate_portfolios")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidatePortfolio {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "cand_portfolio_seq")
    @SequenceGenerator(name = "cand_portfolio_seq", sequenceName = "candidate_portfolio_seq", allocationSize = 1)
    @Column(name = "cand_portfolio_id")
    private Long candPortfolioId;
    
    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;
    
    @Column(name = "portfolio_file_path")
    private String portfolioFilePath;
    
    @Column(name = "portfolio_submission_date", nullable = false)
    private Date portfolioSubmissionDate;
    
    @Column(name = "portfolio_created_at", nullable = false)
    private Date portfolioCreatedAt;
    
    @Column(name = "portfolio_updated_at", nullable = false)
    private Date portfolioUpdatedAt;
    
    @Column(name = "portfolio_analysis_status", length = 20)
    @Builder.Default
    private String portfolioAnalysisStatus = "PENDING";
    
    @PrePersist
    protected void onCreate() {
        this.portfolioCreatedAt = new Date();
        this.portfolioUpdatedAt = new Date();
        this.portfolioSubmissionDate = new Date();
        if (this.portfolioAnalysisStatus == null) {
            this.portfolioAnalysisStatus = "PENDING";
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.portfolioUpdatedAt = new Date();
    }
} 
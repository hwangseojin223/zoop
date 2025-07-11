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

/**
 *
 * @author hwangseojin
 */
@Entity
@Table(name = "portfolios")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Portfolio {
@Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "portfolio_seq")
    @SequenceGenerator(name = "portfolio_seq", sequenceName = "portfolio_id_seq", allocationSize = 1)
    @Column(name = "portfolio_id")
    private Integer portfolioId;
    
    @Column(name = "job_candidate_id", nullable = false)
    private Integer jobCandidateId;
    
    @Column(name = "portfolio_submission_date", nullable = false)
    private Date portfolioSubmissionDate;
    
    @Column(name = "portfolio_file_path")
    private String portfolioFilePath;
    
    @Column(name = "portfolio_analysis_status", nullable = false, length = 20)
    @Builder.Default
    private String portfolioAnalysisStatus = "PENDING";
    
    @Column(name = "portfolio_created_at", nullable = false)
    private Date portfolioCreatedAt;
    
    @Column(name = "portfolio_updated_at", nullable = false)
    private Date portfolioUpdatedAt;
    
    @PrePersist
    protected void onCreate() {
        portfolioCreatedAt = new Date();
        portfolioUpdatedAt = new Date();
        portfolioSubmissionDate = new Date();
        if (portfolioAnalysisStatus == null) {
            portfolioAnalysisStatus = "PENDING";
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        portfolioUpdatedAt = new Date();
    }
}

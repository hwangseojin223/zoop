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
@Table(name = "portfolio_job_matches")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioJobMatch {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "portfolio_job_match_seq")
    @SequenceGenerator(name = "portfolio_job_match_seq", sequenceName = "portfolio_job_match_seq", allocationSize = 1)
    @Column(name = "match_id")
    private Long matchId;
    
    @Column(name = "cand_portfolio_id", nullable = false)
    private Long candPortfolioId;
    
    @Column(name = "post_id", nullable = false)
    private Long postId;
    
    @Column(name = "matching_score", nullable = false)
    private Double matchingScore;
    
    @Column(name = "matching_reason", columnDefinition = "CLOB")
    private String matchingReason;
    
    @Column(name = "match_created_at", nullable = false)
    private Date matchCreatedAt;
    
    @Column(name = "match_updated_at", nullable = false)
    private Date matchUpdatedAt;
    
    @PrePersist
    protected void onCreate() {
        this.matchCreatedAt = new Date();
        this.matchUpdatedAt = new Date();
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.matchUpdatedAt = new Date();
    }
} 
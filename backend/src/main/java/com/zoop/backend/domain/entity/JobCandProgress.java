package com.zoop.backend.domain.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
import lombok.NoArgsConstructor; // <-- JoinColumn 임포트
import lombok.Setter; // <-- ManyToOne 임포트

@Entity
@Table(name = "job_cand_progress")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobCandProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "job_cand_seq")
    @SequenceGenerator(
        name = "job_cand_seq", 
        sequenceName = "JOB_CAND_SEQ", 
        allocationSize = 1
    )
    @Column(name = "job_candidate_id")
    private Long jobCandidateId;

    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate; 

    @Column(name = "invitation_id")
    private Long invitationId;

    @Column(name = "job_cand_curr_stage", length = 10)
    private String jobCandCurrStage;

    @Column(name = "job_cand_portfolio_sub_date")
    private LocalDateTime jobCandPortfolioSubDate;

    @Column(name = "ai_portfolio_analysis_id")
    private Long aiPortfolioAnalysisId;

    @Column(name = "ai_intrvw_schedule_id")
    private Long aiIntrvwScheduleId;

    @Column(name = "job_cand_ai_intrvw_complt_date")
    private LocalDateTime jobCandAiIntrvwCompltDate;

    @Column(name = "ai_intrvw_analysis_id")
    private Long aiIntrvwAnalysisId;

    @Column(name = "admin_intrvw_eval_id")
    private Long adminIntrvwEvalId;

    @Column(name = "job_cand_final_status_for_job", length = 20)
    private String jobCandFinalStatusForJob;

    @Column(name = "job_cand_status_notif_date")
    private LocalDateTime jobCandStatusNotifDate;

    @Column(name = "job_cand_created_at")
    private LocalDateTime jobCandCreatedAt;

    @Column(name = "job_cand_updated_at")
    private LocalDateTime jobCandUpdatedAt;

    @Column(name = "github_login", length = 255)
    private String githubLogin;

    @Column(name = "cand_portfolio_id")
    private Long candPortfolioId;
}

package com.zoop.backend.domain.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "admin_intrvw_evaluations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminInterviewEvaluation {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "admin_intrvw_eval_id_seq")
    @SequenceGenerator(name = "admin_intrvw_eval_id_seq", sequenceName = "admin_intrvw_eval_id_seq", allocationSize = 1)
    @Column(name = "admin_intrvw_eval_id")
    private Long adminIntrvwEvalId;

    @Column(name = "job_candidate_id", nullable = false)
    private Long jobCandidateId;

    @Column(name = "evaluated_by_admin_id", nullable = false)
    private Long evaluatedByAdminId;

    @Column(name = "admin_intrvw_evaluation_date", nullable = false)
    private LocalDateTime adminIntrvwEvaluationDate;

    @Column(name = "admin_intrvw_score")
    private BigDecimal adminIntrvwScore;

    @Column(name = "admin_intrvw_notes", columnDefinition = "CLOB")
    private String adminIntrvwNotes;



    @Column(name = "admin_intrvw_created_at", nullable = false)
    private LocalDateTime adminIntrvwCreatedAt;

    @PrePersist
    protected void onCreate() {
        adminIntrvwCreatedAt = LocalDateTime.now();
        if (adminIntrvwEvaluationDate == null) {
            adminIntrvwEvaluationDate = LocalDateTime.now();
        }
    }
} 
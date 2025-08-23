package com.zoop.backend.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "executive_interview_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExecutiveInterviewResult {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "executive_interview_results_seq")
    @SequenceGenerator(name = "executive_interview_results_seq", sequenceName = "executive_interview_results_seq", allocationSize = 1)
    @Column(name = "result_id")
    private Long resultId;
    
    @Column(name = "schedule_id", nullable = false)
    private Long scheduleId;
    
    @Column(name = "evaluation_score", precision = 5, scale = 2)
    private BigDecimal evaluationScore;
    
    @Column(name = "evaluation_notes", columnDefinition = "CLOB")
    private String evaluationNotes;
    
    @Column(name = "final_decision", length = 20)
    private String finalDecision; // 'PASS', 'FAIL'
    
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    // 면접 일정과의 관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", insertable = false, updatable = false)
    private ExecutiveInterviewSchedule schedule;
} 
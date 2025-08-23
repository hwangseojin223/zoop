package com.zoop.backend.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "executive_interview_schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExecutiveInterviewSchedule {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "executive_interview_schedules_seq")
    @SequenceGenerator(name = "executive_interview_schedules_seq", sequenceName = "executive_interview_schedules_seq", allocationSize = 1)
    @Column(name = "schedule_id")
    private Long scheduleId;
    
    @Column(name = "job_candidate_id", nullable = false)
    private Long jobCandidateId;
    
    @Column(name = "post_id", nullable = false)
    private Long postId;
    
    @Column(name = "company_admin_id", nullable = false)
    private Long companyAdminId;
    
    @Column(name = "interview_date", nullable = false)
    private LocalDateTime interviewDate;
    
    @Column(name = "time_slot", length = 50, nullable = false)
    private String timeSlot;
    
    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "SCHEDULED";
    
    @Column(name = "notes", columnDefinition = "CLOB")
    private String notes;
    
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
} 
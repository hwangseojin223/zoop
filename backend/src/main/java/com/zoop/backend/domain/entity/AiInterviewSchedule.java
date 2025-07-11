package com.zoop.backend.domain.entity;

<<<<<<< HEAD
/**
 *
 * @author hwangseojin
 */
=======
>>>>>>> feat/93/interview-ai
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
<<<<<<< HEAD
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
=======
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
>>>>>>> feat/93/interview-ai
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ai_interview_schedules")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class AiInterviewSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "ai_interview_schedule_seq")
    @SequenceGenerator(name = "ai_interview_schedule_seq", sequenceName = "ai_interview_schedule_id_seq", allocationSize = 1)
    @Column(name = "ai_intrvw_schedule_id")
<<<<<<< HEAD
    private Integer aiInterviewScheduleId;
    
    @Column(name = "job_candidate_id", nullable = false)
    private Integer jobCandidateId;
    
    @Column(name = "ai_interview_scheduled_time")
    private LocalDateTime aiInterviewScheduledTime;
    
    @Column(name = "ai_interview_deadline_time", nullable = false)
    private LocalDateTime aiInterviewDeadlineTime;
    
    @Column(name = "ai_interview_link", nullable = false)
    private String aiInterviewLink;
    
    @Column(name = "ai_interview_status", nullable = false)
    private String aiInterviewStatus;
    
    @Column(name = "ai_interview_completion_time")
    private LocalDateTime aiInterviewCompletionTime;
    
    @Column(name = "ai_interview_created_at", nullable = false)
    private LocalDateTime aiInterviewCreatedAt;
    
    @Column(name = "ai_interview_updated_at", nullable = false)
    private LocalDateTime aiInterviewUpdatedAt;
    
=======
    private Long aiInterviewScheduleId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "job_candidate_id", referencedColumnName = "job_candidate_id", nullable = false)
    private JobCandProgress jobCandProgress;

    @Column(name = "ai_interview_completion_time")
    private LocalDateTime aiInterviewCompletionTime;

    @Column(name = "ai_analysis_status")
    private String aiAnalysisStatus;

    @Column(name = "ai_interview_scheduled_time", nullable = false)
    private LocalDateTime aiInterviewScheduledTime;

    @Column(name = "ai_interview_deadline_time", nullable = false)
    private LocalDateTime aiInterviewDeadlineTime;

    @Column(name = "ai_interview_link", length = 1000)
    private String aiInterviewLink;

    @Column(name = "ai_interview_status", length = 20, nullable = false)
    private String aiInterviewStatus;

    @Column(name = "ai_interview_created_at", nullable = false)
    private LocalDateTime aiInterviewCreatedAt;

    @Column(name = "ai_interview_updated_at", nullable = false)
    private LocalDateTime aiInterviewUpdatedAt;

>>>>>>> feat/93/interview-ai
    @PrePersist
    protected void onCreate() {
        aiInterviewCreatedAt = LocalDateTime.now();
        aiInterviewUpdatedAt = LocalDateTime.now();
    }
<<<<<<< HEAD
    
    @PreUpdate
    protected void onUpdate() {
        aiInterviewUpdatedAt = LocalDateTime.now();
    }
}




=======
} 
>>>>>>> feat/93/interview-ai

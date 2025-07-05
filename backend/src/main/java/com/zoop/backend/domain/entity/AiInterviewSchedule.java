// Entity: AiInterviewSchedule.java
package com.zoop.backend.domain.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ai_interview_schedules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiInterviewSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ai_intrvw_schedule_id")
    private Long aiIntrvwScheduleId;

    @Column(name = "job_candidate_id", nullable = false, unique = true)
    private Long jobCandidateId;

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

    @Column(name = "video_file_path")
    private String videoFilePath;
}
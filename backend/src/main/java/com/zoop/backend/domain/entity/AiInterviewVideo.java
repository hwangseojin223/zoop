package com.zoop.backend.domain.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ai_interview_videos",
    uniqueConstraints = @UniqueConstraint(columnNames = {"ai_intrvw_schedule_id", "question_number"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class AiInterviewVideo {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "ai_interview_video_seq")
    @SequenceGenerator(name = "ai_interview_video_seq", sequenceName = "ai_interview_video_id_seq", allocationSize = 1)
    @Column(name = "video_id")
    private Long videoId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ai_intrvw_schedule_id", nullable = false)
    private AiInterviewSchedule aiInterviewSchedule;

    @Column(name = "question_number", nullable = false)
    private Integer questionNumber;

    @Column(name = "question_content", length = 1000)
    private String questionContent;

    @Column(name = "video_file_path", nullable = false, length = 1000)
    private String videoFilePath;

    @Column(name = "video_created_at", nullable = false)
    private LocalDateTime videoCreatedAt;

    @PrePersist
    protected void onCreate() {
        videoCreatedAt = LocalDateTime.now();
    }
} 
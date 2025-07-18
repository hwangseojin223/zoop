package com.zoop.backend.domain.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "interview_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "interview_question_seq")
    @SequenceGenerator(
        name = "interview_question_seq",
        sequenceName = "interview_question_seq",
        allocationSize = 1
    )
    @Column(name = "question_id")
    private Long questionId;

    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Column(name = "job_candidate_id", nullable = false)
    private Long jobCandidateId;

    @Lob
    @Column(name = "questions_json", nullable = false)
    private String questionsJson;

    @Column(name = "content_hash", nullable = false, length = 255)
    private String contentHash;

    @Column(name = "generated_at", nullable = false)
    private LocalDateTime generatedAt;

    @Column(name = "interview_deadline", nullable = false)
    private LocalDateTime interviewDeadline;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        this.generatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
} 
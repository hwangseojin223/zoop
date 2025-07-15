package com.zoop.backend.domain.entity;

import java.sql.Timestamp;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "candidate_resumes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CandidateResume {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "candidate_resume_seq")
    @SequenceGenerator(name = "candidate_resume_seq", sequenceName = "candidate_resume_seq", allocationSize = 1)
    @Column(name = "resume_id")
    private Long resumeId;

    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;

    @Lob
    @Column(name = "self_intro")
    private String selfIntro;

    @Column(name = "created_at")
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    @Column(name = "is_public")
    private String isPublic;

    @Column(name = "status")
    private String status;

    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ResumeEducation> educations;

    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ResumeExperience> experiences;
} 
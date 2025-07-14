package com.zoop.backend.domain.entity;

import java.sql.Timestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
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
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "resume_educations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ResumeEducation {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "resume_education_seq")
    @SequenceGenerator(name = "resume_education_seq", sequenceName = "resume_education_seq", allocationSize = 1)
    @Column(name = "education_id")
    private Long educationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private CandidateResume resume;

    @Column(name = "school_type")
    private String schoolType;

    @Column(name = "school_name")
    private String schoolName;

    @Column(name = "graduation_status")
    private String graduationStatus;

    @Column(name = "admission_year")
    private String admissionYear;

    @Column(name = "admission_month")
    private String admissionMonth;

    @Column(name = "graduation_year")
    private String graduationYear;

    @Column(name = "graduation_month")
    private String graduationMonth;

    @Column(name = "region")
    private String region;

    @Column(name = "major")
    private String major;

    @Column(name = "created_at")
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;
} 
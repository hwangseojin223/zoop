package com.zoop.backend.domain.entity;

import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "resume_experiences")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ResumeExperience {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "resume_experience_seq")
    @SequenceGenerator(name = "resume_experience_seq", sequenceName = "resume_experience_seq", allocationSize = 1)
    @Column(name = "experience_id")
    private Long experienceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    @JsonIgnore
    private CandidateResume resume;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "is_company_hidden")
    private String isCompanyHidden;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "department")
    private String department;

    @Column(name = "position")
    private String position;

    @Column(name = "start_year")
    private String startYear;

    @Column(name = "start_month")
    private String startMonth;

    @Column(name = "end_year")
    private String endYear;

    @Column(name = "end_month")
    private String endMonth;

    @Column(name = "is_current")
    private String isCurrent;

    @Column(name = "work_region")
    private String workRegion;

    @Column(name = "leaving_reason")
    private String leavingReason;

    @Lob
    @Column(name = "main_tasks")
    private String mainTasks;

    @Column(name = "created_at")
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;
} 
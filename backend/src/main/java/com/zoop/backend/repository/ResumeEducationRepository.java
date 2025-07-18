package com.zoop.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zoop.backend.domain.entity.ResumeEducation;

public interface ResumeEducationRepository extends JpaRepository<ResumeEducation, Long> {
    List<ResumeEducation> findByResume_ResumeId(Long resumeId);
    void deleteByResume_ResumeId(Long resumeId);
} 
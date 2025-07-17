package com.zoop.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zoop.backend.domain.entity.ResumeExperience;
import java.util.List;

public interface ResumeExperienceRepository extends JpaRepository<ResumeExperience, Long> {
    List<ResumeExperience> findByResume_ResumeId(Long resumeId);
    void deleteByResume_ResumeId(Long resumeId);
} 
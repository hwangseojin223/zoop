package com.zoop.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zoop.backend.domain.entity.Candidate;
import com.zoop.backend.domain.entity.CandidateJobExperience;

public interface CandidateJobExperienceRepository extends JpaRepository<CandidateJobExperience, Long> {
    List<CandidateJobExperience> findByCandidate(Candidate candidate);
} 
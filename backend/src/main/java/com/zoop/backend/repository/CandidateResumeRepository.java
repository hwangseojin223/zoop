package com.zoop.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zoop.backend.domain.entity.CandidateResume;

public interface CandidateResumeRepository extends JpaRepository<CandidateResume, Long> {
    List<CandidateResume> findByCandidateIdOrderByCreatedAtDesc(Long candidateId);
} 
package com.zoop.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zoop.backend.domain.entity.AdminInterviewEvaluation;

@Repository
public interface AdminInterviewEvaluationRepository extends JpaRepository<AdminInterviewEvaluation, Long> {
    Optional<AdminInterviewEvaluation> findByJobCandidateId(Long jobCandidateId);
} 
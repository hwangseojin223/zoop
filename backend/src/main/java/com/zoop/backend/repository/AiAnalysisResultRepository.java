package com.zoop.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zoop.backend.domain.entity.AiAnalysisResults;

@Repository
public interface AiAnalysisResultRepository extends JpaRepository<AiAnalysisResults, Long> {

    Optional<AiAnalysisResults> findByJobCandidateIdAndAnalysisType(Long jobCandidateId, String analysisType);
}


package com.zoop.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zoop.backend.domain.entity.CandidatePortfolio;

@Repository
public interface CandidatePortfolioRepository extends JpaRepository<CandidatePortfolio, Long> {
    List<CandidatePortfolio> findByCandidateIdOrderByPortfolioCreatedAtDesc(Long candidateId);
    List<CandidatePortfolio> findByPortfolioAnalysisStatus(String status);
} 
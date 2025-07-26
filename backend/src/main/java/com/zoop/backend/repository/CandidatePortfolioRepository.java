package com.zoop.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.zoop.backend.domain.entity.CandidatePortfolio;

@Repository
public interface CandidatePortfolioRepository extends JpaRepository<CandidatePortfolio, Long> {
    List<CandidatePortfolio> findByCandidateIdOrderByPortfolioCreatedAtDesc(Long candidateId);
    List<CandidatePortfolio> findByPortfolioAnalysisStatus(String status);

    @Modifying
    @Transactional
    @Query("UPDATE CandidatePortfolio c SET c.portfolioAnalysisStatus = :status WHERE c.candPortfolioId = :candPortfolioId")
    int updatePortfolioStatus(@Param("candPortfolioId") Long candPortfolioId, @Param("status") String status);
} 
package com.zoop.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zoop.backend.domain.entity.Portfolio;

/**
 *
 * @author hwangseojin
 */

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, Integer> {
    List<Portfolio> findByJobCandidateId(Integer jobCandidateId);
    Optional<Portfolio> findByJobCandidateIdAndPortfolioId(Integer jobCandidateId, Integer portfolioId);
<<<<<<< HEAD
    Optional<Portfolio> findByJobCandidateId(Long jobCandidateId);
=======
>>>>>>> feat/93/interview-ai
    
}
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
    
    // 내 버전: 분석 상태별 포트폴리오 조회 (매우 유용한 기능)
    List<Portfolio> findByPortfolioAnalysisStatus(String portfolioAnalysisStatus);
    
    // 팀 버전: Long 타입 jobCandidateId 오버로드 메서드
    Optional<Portfolio> findByJobCandidateId(Long jobCandidateId);
}
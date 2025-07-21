package com.zoop.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.zoop.backend.domain.entity.PortfolioJobMatch;

@Repository
public interface PortfolioJobMatchRepository extends JpaRepository<PortfolioJobMatch, Long> {
    
    // 포트폴리오 ID로 매칭 결과 조회
    List<PortfolioJobMatch> findByCandPortfolioIdOrderByMatchingScoreDesc(Long candPortfolioId);
    
    // 공고 ID로 매칭 결과 조회
    List<PortfolioJobMatch> findByPostIdOrderByMatchingScoreDesc(Long postId);
    
    // 특정 포트폴리오와 공고의 매칭 결과 조회
    Optional<PortfolioJobMatch> findByCandPortfolioIdAndPostId(Long candPortfolioId, Long postId);
    
    // 매칭 점수가 특정 값 이상인 결과 조회
    @Query("SELECT pjm FROM PortfolioJobMatch pjm WHERE pjm.matchingScore >= :minScore ORDER BY pjm.matchingScore DESC")
    List<PortfolioJobMatch> findByMatchingScoreGreaterThanEqual(@Param("minScore") Double minScore);
    
    // 특정 공고의 상위 매칭 결과 조회
    @Query("SELECT pjm FROM PortfolioJobMatch pjm WHERE pjm.postId = :postId AND pjm.matchingScore >= :minScore ORDER BY pjm.matchingScore DESC")
    List<PortfolioJobMatch> findTopMatchesByPostId(@Param("postId") Long postId, @Param("minScore") Double minScore);
} 
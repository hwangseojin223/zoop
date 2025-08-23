package com.zoop.backend.repository;

import com.zoop.backend.domain.entity.ExecutiveInterviewResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExecutiveInterviewResultRepository extends JpaRepository<ExecutiveInterviewResult, Long> {
    
    // 면접 일정 ID로 결과 조회
    Optional<ExecutiveInterviewResult> findByScheduleId(Long scheduleId);
    
    // 면접 일정 ID로 결과 존재 여부 확인
    boolean existsByScheduleId(Long scheduleId);
    
    // 최종 결정별 결과 조회
    List<ExecutiveInterviewResult> findByFinalDecision(String finalDecision);
    
    // 평가 점수 범위로 결과 조회
    List<ExecutiveInterviewResult> findByEvaluationScoreBetween(Double minScore, Double maxScore);
} 
package com.zoop.backend.repository;

import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zoop.backend.domain.entity.ExecutiveInterviewSchedule;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExecutiveInterviewScheduleRepository extends JpaRepository<ExecutiveInterviewSchedule, Long> {
    
    // 특정 공고의 모든 임원면접 일정 조회
    List<ExecutiveInterviewSchedule> findByPostIdOrderByInterviewDateAsc(Long postId);
    
    // 특정 상태의 모든 임원면접 일정 조회
    List<ExecutiveInterviewSchedule> findByStatusOrderByInterviewDateAsc(String status);
    
    // 특정 지원자의 임원면접 일정 조회
    List<ExecutiveInterviewSchedule> findByJobCandidateId(Long jobCandidateId);
    
    // 특정 공고의 특정 상태인 임원면접 일정 조회
    List<ExecutiveInterviewSchedule> findByPostIdAndStatusOrderByInterviewDateAsc(Long postId, String status);
    
    // 특정 지원자의 특정 공고에 대한 임원면접 일정 조회
    Optional<ExecutiveInterviewSchedule> findByJobCandidateIdAndPostId(Long jobCandidateId, Long postId);
    
    // 특정 회사 관리자의 모든 임원면접 일정 조회
    List<ExecutiveInterviewSchedule> findByCompanyAdminIdOrderByInterviewDateAsc(Long companyAdminId);

    /**
     * 지원자 ID와 공고 ID로 면접 일정 조회 (최신순)
     */
    List<ExecutiveInterviewSchedule> findByJobCandidateIdAndPostIdOrderByInterviewDateDesc(Long jobCandidateId, Long postId);
} 
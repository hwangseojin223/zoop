package com.zoop.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zoop.backend.domain.entity.AiInterviewSchedule;

@Repository
public interface AiInterviewScheduleRepository extends JpaRepository<AiInterviewSchedule, Long> {
    List<AiInterviewSchedule> findByJobCandProgress_JobCandidateId(Long jobCandidateId);
    Optional<AiInterviewSchedule> findByJobCandProgress_JobCandidateIdAndAiInterviewScheduleId(Long jobCandidateId, Long scheduleId);
    List<AiInterviewSchedule> findByAiAnalysisStatus(String analysisStatus);
}

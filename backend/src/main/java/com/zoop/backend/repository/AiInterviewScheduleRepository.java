package com.zoop.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zoop.backend.domain.entity.AiInterviewSchedule;

/**
 *
 * @author hwangseojin
 */
@Repository
<<<<<<< HEAD
public interface AiInterviewScheduleRepository extends JpaRepository<AiInterviewSchedule, Integer> {
    List<AiInterviewSchedule> findByJobCandidateId(Integer jobCandidateId);
    Optional<AiInterviewSchedule> findByJobCandidateIdAndAiInterviewScheduleId(Integer jobCandidateId, Integer scheduleId);

    Optional<AiInterviewSchedule> findByJobCandidateId(Long jobCandidateId);
=======
public interface AiInterviewScheduleRepository extends JpaRepository<AiInterviewSchedule, Long> {
    List<AiInterviewSchedule> findByJobCandProgress_JobCandidateId(Long jobCandidateId);
    Optional<AiInterviewSchedule> findByJobCandProgress_JobCandidateIdAndAiInterviewScheduleId(Long jobCandidateId, Long scheduleId);
    List<AiInterviewSchedule> findByAiAnalysisStatus(String analysisStatus);
>>>>>>> feat/93/interview-ai
}

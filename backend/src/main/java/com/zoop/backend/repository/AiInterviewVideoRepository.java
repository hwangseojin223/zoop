package com.zoop.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zoop.backend.domain.entity.AiInterviewVideo;

@Repository
public interface AiInterviewVideoRepository extends JpaRepository<AiInterviewVideo, Long> {
<<<<<<< HEAD
    List<AiInterviewVideo> findByAiInterviewSchedule_AiInterviewScheduleId(Integer aiInterviewScheduleId);
    AiInterviewVideo findByAiInterviewSchedule_AiInterviewScheduleIdAndQuestionNumber(Integer aiInterviewScheduleId, Integer questionNumber);
=======
    List<AiInterviewVideo> findByAiInterviewSchedule_AiInterviewScheduleId(Integer scheduleId);
    List<AiInterviewVideo> findByAiInterviewSchedule_JobCandProgress_JobCandidateId(Long jobCandidateId);
>>>>>>> feat/93/interview-ai
} 
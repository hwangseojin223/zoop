package com.zoop.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zoop.backend.domain.entity.AiInterviewVideo;

@Repository
public interface AiInterviewVideoRepository extends JpaRepository<AiInterviewVideo, Long> {
    List<AiInterviewVideo> findByAiInterviewSchedule_AiInterviewScheduleId(Integer aiInterviewScheduleId);
    AiInterviewVideo findByAiInterviewSchedule_AiInterviewScheduleIdAndQuestionNumber(Integer aiInterviewScheduleId, Integer questionNumber);
} 
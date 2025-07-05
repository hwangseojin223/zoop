// Service: AiInterviewScheduleService.java
package com.zoop.backend.service;

import com.zoop.backend.domain.dto.modal.AiInterviewScheduleResponse;
import com.zoop.backend.domain.dto.modal.InterviewVideoResponse;
import com.zoop.backend.domain.entity.AiInterviewSchedule;
import com.zoop.backend.repository.AiInterviewScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AiInterviewScheduleService {

    private final AiInterviewScheduleRepository repository;

    public Optional<AiInterviewScheduleResponse> getScheduleInfo(Long jobCandidateId) {
        return repository.findByJobCandidateId(jobCandidateId)
                .map(s -> new AiInterviewScheduleResponse(s.getAiInterviewScheduledTime(), s.getAiInterviewStatus()));
    }

    public Optional<InterviewVideoResponse> getInterviewVideo(Long jobCandidateId) {
        return repository.findByJobCandidateId(jobCandidateId)
                .map(AiInterviewSchedule::getVideoFilePath)
                .filter(path -> path != null && !path.isBlank())
                .map(InterviewVideoResponse::new);
    }
}
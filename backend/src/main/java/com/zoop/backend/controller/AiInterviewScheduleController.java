// Controller: AiInterviewScheduleController.java
package com.zoop.backend.controller;

import com.zoop.backend.domain.dto.modal.AiInterviewScheduleResponse;
import com.zoop.backend.domain.dto.modal.InterviewVideoResponse;
import com.zoop.backend.service.AiInterviewScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class AiInterviewScheduleController {

    private final AiInterviewScheduleService service;

    @GetMapping("/{jobCandidateId}/schedule")
    public ResponseEntity<?> getScheduledInterview(@PathVariable Long jobCandidateId) {
        return service.getScheduleInfo(jobCandidateId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body("면접 일정이 존재하지 않습니다."));
    }

    @GetMapping("/{jobCandidateId}/video")
    public ResponseEntity<InterviewVideoResponse> getInterviewVideo(@PathVariable Long jobCandidateId) {
        return service.getInterviewVideo(jobCandidateId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
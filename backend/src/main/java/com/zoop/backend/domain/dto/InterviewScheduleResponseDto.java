package com.zoop.backend.domain.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewScheduleResponseDto {
<<<<<<< HEAD
    private Integer scheduleId;
    private Integer jobCandidateId;
=======
    private Long scheduleId;
    private Long jobCandidateId;
>>>>>>> feat/93/interview-ai
    private LocalDateTime scheduledTime;
    private LocalDateTime deadlineTime;
    private String interviewLink;
    private String status;
    private String message;
    private boolean success;

    
}


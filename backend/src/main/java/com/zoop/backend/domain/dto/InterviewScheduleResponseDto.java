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
    private Long scheduleId;
    private Long jobCandidateId;
    private LocalDateTime scheduledTime;
    private LocalDateTime deadlineTime;
    private String interviewLink;
    private String status;
    private String message;
    private boolean success;

    
}


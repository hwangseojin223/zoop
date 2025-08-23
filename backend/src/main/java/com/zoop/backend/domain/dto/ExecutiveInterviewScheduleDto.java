package com.zoop.backend.domain.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExecutiveInterviewScheduleDto {
    
    private Long scheduleId;
    private Long jobCandidateId;
    private Long postId;
    private Long companyAdminId;
    private LocalDateTime interviewDate;
    private String timeSlot;
    private String status;
    private String notes;
    private LocalDateTime createdAt;
} 
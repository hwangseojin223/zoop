package com.zoop.backend.domain.dto;

import lombok.Data;

@Data
public class InterviewScheduleRequestDto {
    private Integer postId;
    private Integer candidateId;
    private String scheduledTime;
}

package com.zoop.backend.domain.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class InterviewScheduleRequestDto {
    private Integer postId;
    private Integer candidateId;
    private String scheduledTime;
}

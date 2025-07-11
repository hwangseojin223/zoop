package com.zoop.backend.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
<<<<<<< HEAD
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class InterviewScheduleRequestDto {
    private Integer postId;
    private Integer candidateId;
=======
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewScheduleRequestDto {
    private Long postId;
    private Long candidateId;
>>>>>>> feat/93/interview-ai
    private String scheduledTime;
}

package com.zoop.backend.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExecutiveInterviewCandidateDto {
    
    // JobCandProgress 정보
    private Long jobCandidateId;
    private Long postId;
    private String jobCandCurrStage;
    private String candidateEmail;
    private String githubLogin;
    private String githubProfileUrl;
    private LocalDateTime githubCreatedAt;
    private LocalDateTime githubSearchDate;
    private Long githubSearchResultId;
    private Long aiGithubAnalysisId;
    private Integer analysisScore;
    
    // 추가 정보
    private Long scheduleId;  // executive_interview_schedules의 schedule_id
    private String interviewStatus;  // 면접 상태
    private LocalDateTime interviewDate;  // 면접 일시
    private String timeSlot;  // 면접 시간대
    
    // 후보자 정보
    private String candidateName;
    private String postTitle;
} 
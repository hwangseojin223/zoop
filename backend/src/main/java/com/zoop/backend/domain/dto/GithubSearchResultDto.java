package com.zoop.backend.domain.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GithubSearchResultDto {

    private Long githubSearchResultId;
    private Long postId;
    private String githubLogin;
    private String githubProfileUrl;
    private Double analysisScore;
    private String candidateEmail;
    private LocalDateTime githubSearchDate;
    private LocalDateTime githubCreatedAt;
    private Long aiGithubAnalysisId;
} 
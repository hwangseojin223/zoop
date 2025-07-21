package com.zoop.backend.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobCandProgressWithCandidateDto {
    private Long jobCandidateId;
    private String githubLogin;
    private String jobCandCurrStage;
    private String candidateEmail;
    private String candidateName;
    private String candidatePhoneNumber;
    private Long postId;
    private String postTitle;
    private Long candidateId;
} 
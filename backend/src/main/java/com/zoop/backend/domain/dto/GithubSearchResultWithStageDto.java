package com.zoop.backend.domain.dto;

import lombok.Data;

@Data
public class GithubSearchResultWithStageDto {

    private String githubLogin;
    private String candidateEmail;
    private String githubProfileUrl;
    private Double githubAnalysisScore;
    private Double aiAnalysisScore;
    private String analysisData;
    private String jobCandCurrStage;
    private Long companyAdminId;
    private Long jobCandidateId; // ✅ 추가된 필드

    public GithubSearchResultWithStageDto(String githubLogin, String candidateEmail,
                                        String githubProfileUrl,
                                        Double githubAnalysisScore,
                                        Double aiAnalysisScore,
                                        String analysisData,
                                        String jobCandCurrStage,
                                        Long companyAdminId,
                                        Long jobCandidateId) {
        this.githubLogin = githubLogin;
        this.candidateEmail = candidateEmail;
        this.githubProfileUrl = githubProfileUrl;
        this.githubAnalysisScore = githubAnalysisScore;
        this.aiAnalysisScore = aiAnalysisScore;
        this.analysisData = analysisData;
        this.jobCandCurrStage = jobCandCurrStage;
        this.companyAdminId = companyAdminId;
        this.jobCandidateId = jobCandidateId;
    }

    // Getters 생략 가능 (Lombok 사용 시 @Getter)
}
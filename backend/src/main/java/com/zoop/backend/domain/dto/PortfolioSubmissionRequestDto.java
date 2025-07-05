package com.zoop.backend.domain.dto;

import lombok.Data;

/**
 *
 * @author hwangseojin
 */
@Data
public class PortfolioSubmissionRequestDto {
    private Integer postId;
    private Integer candidateId;
    private String portfolioContent;
    private String portfolioUrl;
    private String goalStatement;
    private String suitabilityStatement;
    private CareerDataDto careerData;
    private boolean agreeRequiredPersonal;
    private boolean agreeOptionalPersonal;
    private boolean agreeFutureProposals;
    private boolean agreeReceiveRecruitmentInfo;

}

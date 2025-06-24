package com.zoop.backend.domain.dto;

import lombok.Data;

/**
 *
 * @author hwangseojin
 */

@Data
public class JobPostingResponseDto {
    private Long postId;
    private String postTitle;
    private String companyName; // 회사 이름 추가
    private String postLocation;
    private String jobCandCurrStage; // 후보자의 현재 진행 단계

    // 생성자 (필요에 따라 추가)
    public JobPostingResponseDto(Long postId, String postTitle, String companyName, String postLocation, String jobCandCurrStage) {
        this.postId = postId;
        this.postTitle = postTitle;
        this.companyName = companyName;
        this.postLocation = postLocation;
        this.jobCandCurrStage = jobCandCurrStage;
    }

    // 기본 생성자 (Jackson 등이 필요로 할 수 있습니다)
    public JobPostingResponseDto() {
    }
}

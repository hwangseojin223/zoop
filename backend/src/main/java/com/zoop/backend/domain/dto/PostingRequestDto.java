package com.zoop.backend.domain.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class PostingRequestDto {
    private Long companyId;             // ✅ 추가
    private Long companyAdminId;  

    private String postTitle;
    private String postDescription;
    private String postProgrammingLanguage;
    private String postLocation;
    private Integer postHeadcount;
    private String postSalaryStart;
    private String postSalaryEnd;
    private LocalDate postPostedDate;
    private LocalDate postExpiryDate;
    private String postStatus;
    private String postIdealCandidate;  // 인재상 필드 추가
}

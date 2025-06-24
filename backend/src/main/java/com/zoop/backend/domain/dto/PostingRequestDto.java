package com.zoop.backend.domain.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
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
}

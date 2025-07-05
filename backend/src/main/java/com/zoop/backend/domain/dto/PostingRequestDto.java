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
    private String postIdealCandidate;  // 인재상 필드 추가

    // 수동으로 getter/setter 추가
    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
    
    public Long getCompanyAdminId() { return companyAdminId; }
    public void setCompanyAdminId(Long companyAdminId) { this.companyAdminId = companyAdminId; }
    
    public String getPostTitle() { return postTitle; }
    public void setPostTitle(String postTitle) { this.postTitle = postTitle; }
    
    public String getPostDescription() { return postDescription; }
    public void setPostDescription(String postDescription) { this.postDescription = postDescription; }
    
    public String getPostProgrammingLanguage() { return postProgrammingLanguage; }
    public void setPostProgrammingLanguage(String postProgrammingLanguage) { this.postProgrammingLanguage = postProgrammingLanguage; }
    
    public String getPostLocation() { return postLocation; }
    public void setPostLocation(String postLocation) { this.postLocation = postLocation; }
    
    public Integer getPostHeadcount() { return postHeadcount; }
    public void setPostHeadcount(Integer postHeadcount) { this.postHeadcount = postHeadcount; }
    
    public String getPostSalaryStart() { return postSalaryStart; }
    public void setPostSalaryStart(String postSalaryStart) { this.postSalaryStart = postSalaryStart; }
    
    public String getPostSalaryEnd() { return postSalaryEnd; }
    public void setPostSalaryEnd(String postSalaryEnd) { this.postSalaryEnd = postSalaryEnd; }
    
    public LocalDate getPostPostedDate() { return postPostedDate; }
    public void setPostPostedDate(LocalDate postPostedDate) { this.postPostedDate = postPostedDate; }
    
    public LocalDate getPostExpiryDate() { return postExpiryDate; }
    public void setPostExpiryDate(LocalDate postExpiryDate) { this.postExpiryDate = postExpiryDate; }
    
    public String getPostStatus() { return postStatus; }
    public void setPostStatus(String postStatus) { this.postStatus = postStatus; }
    
    public String getPostIdealCandidate() { return postIdealCandidate; }
    public void setPostIdealCandidate(String postIdealCandidate) { this.postIdealCandidate = postIdealCandidate; }
}

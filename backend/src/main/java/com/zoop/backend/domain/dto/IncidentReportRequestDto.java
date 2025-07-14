package com.zoop.backend.domain.dto;

public class IncidentReportRequestDto {
    private String email;
    private String content;
    private String role;
    private String reporterType;
    private Long reporterId;

    // 기본 생성자
    public IncidentReportRequestDto() {}

    // 생성자
    public IncidentReportRequestDto(String email, String content, String role, String reporterType, Long reporterId) {
        this.email = email;
        this.content = content;
        this.role = role;
        this.reporterType = reporterType;
        this.reporterId = reporterId;
    }

    // Getter와 Setter
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getReporterType() {
        return reporterType;
    }

    public void setReporterType(String reporterType) {
        this.reporterType = reporterType;
    }

    public Long getReporterId() {
        return reporterId;
    }

    public void setReporterId(Long reporterId) {
        this.reporterId = reporterId;
    }
} 
package com.zoop.backend.domain.dto;

public class IncidentReportResponseDto {
    private boolean success;
    private String message;
    private Long reportId;

    // 기본 생성자
    public IncidentReportResponseDto() {}

    // 생성자
    public IncidentReportResponseDto(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public IncidentReportResponseDto(boolean success, String message, Long reportId) {
        this.success = success;
        this.message = message;
        this.reportId = reportId;
    }

    // Getter와 Setter
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getReportId() {
        return reportId;
    }

    public void setReportId(Long reportId) {
        this.reportId = reportId;
    }
} 
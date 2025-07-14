package com.zoop.backend.domain.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "incident_reports")
public class IncidentReport {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String email;
    
    @Column(name = "Report_content", columnDefinition = "TEXT", nullable = false)
    private String content;
    
    @Column(nullable = false)
    private String role;
    
    @Column(nullable = false)
    private String reporterType;
    
    private Long reporterId;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, PROCESSING, COMPLETED, REJECTED
    
    private String adminComment;
    
    private LocalDateTime processedAt;

    // 기본 생성자
    public IncidentReport() {
        this.createdAt = LocalDateTime.now();
    }

    // 생성자
    public IncidentReport(String email, String content, String role, String reporterType, Long reporterId) {
        this.email = email;
        this.content = content;
        this.role = role;
        this.reporterType = reporterType;
        this.reporterId = reporterId;
        this.createdAt = LocalDateTime.now();
        this.status = "PENDING";
    }

    // Getter와 Setter
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAdminComment() {
        return adminComment;
    }

    public void setAdminComment(String adminComment) {
        this.adminComment = adminComment;
    }

    public LocalDateTime getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(LocalDateTime processedAt) {
        this.processedAt = processedAt;
    }
} 
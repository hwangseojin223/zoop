package com.zoop.backend.domain.entity;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Column;
import jakarta.persistence.Table;
import jakarta.persistence.SequenceGenerator;

@Entity
@Table(name = "company_notification_settings")
@Schema(description="기업회원 알림 설정 정보를 나타내는 엔티티")
public class CompanyNotificationSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "company_notification_settings_seq")
    @SequenceGenerator(name = "company_notification_settings_seq", sequenceName = "COMPANY_NOTIFICATION_SETTINGS_SEQ", allocationSize = 1)
    @Schema(description="설정 고유 ID", example="1", accessMode=Schema.AccessMode.READ_ONLY)
    private Long settingId;

    @Column(name = "company_admin_id", nullable = false, unique = true)
    @Schema(description="회사 관리자 ID", example="68")
    private Long companyAdminId;

    @Column(name = "email_notifications", nullable = false)
    @Schema(description="이메일 알림 활성화 여부", example="true")
    private boolean emailNotifications = true;

    @Column(name = "push_notifications", nullable = false)
    @Schema(description="푸시 알림 활성화 여부", example="true")
    private boolean pushNotifications = true;

    @Column(name = "weekly_reports", nullable = false)
    @Schema(description="주간 리포트 활성화 여부", example="false")
    private boolean weeklyReports = false;

    @Column(name = "candidate_updates", nullable = false)
    @Schema(description="후보자 업데이트 알림 활성화 여부", example="true")
    private boolean candidateUpdates = true;

    @Column(name = "new_applications", nullable = false)
    @Schema(description="새 지원자 알림 활성화 여부", example="true")
    private boolean newApplications = true;

    @Column(name = "interview_analysis", nullable = false)
    @Schema(description="면접 분석 완료 알림 활성화 여부", example="true")
    private boolean interviewAnalysis = true;

    @Column(name = "portfolio_matching", nullable = false)
    @Schema(description="포트폴리오 매칭 알림 활성화 여부", example="true")
    private boolean portfolioMatching = true;

    @Column(name = "post_expiry", nullable = false)
    @Schema(description="공고 마감 임박 알림 활성화 여부", example="true")
    private boolean postExpiry = true;

    @Column(name = "created_at", nullable = false)
    @Schema(description="설정 생성 시각")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @Schema(description="설정 수정 시각")
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getSettingId() {
        return settingId;
    }

    public void setSettingId(Long settingId) {
        this.settingId = settingId;
    }

    public Long getCompanyAdminId() {
        return companyAdminId;
    }

    public void setCompanyAdminId(Long companyAdminId) {
        this.companyAdminId = companyAdminId;
    }

    public boolean isEmailNotifications() {
        return emailNotifications;
    }

    public void setEmailNotifications(boolean emailNotifications) {
        this.emailNotifications = emailNotifications;
    }

    public boolean isPushNotifications() {
        return pushNotifications;
    }

    public void setPushNotifications(boolean pushNotifications) {
        this.pushNotifications = pushNotifications;
    }

    public boolean isWeeklyReports() {
        return weeklyReports;
    }

    public void setWeeklyReports(boolean weeklyReports) {
        this.weeklyReports = weeklyReports;
    }

    public boolean isCandidateUpdates() {
        return candidateUpdates;
    }

    public void setCandidateUpdates(boolean candidateUpdates) {
        this.candidateUpdates = candidateUpdates;
    }

    public boolean isNewApplications() {
        return newApplications;
    }

    public void setNewApplications(boolean newApplications) {
        this.newApplications = newApplications;
    }

    public boolean isInterviewAnalysis() {
        return interviewAnalysis;
    }

    public void setInterviewAnalysis(boolean interviewAnalysis) {
        this.interviewAnalysis = interviewAnalysis;
    }

    public boolean isPortfolioMatching() {
        return portfolioMatching;
    }

    public void setPortfolioMatching(boolean portfolioMatching) {
        this.portfolioMatching = portfolioMatching;
    }

    public boolean isPostExpiry() {
        return postExpiry;
    }

    public void setPostExpiry(boolean postExpiry) {
        this.postExpiry = postExpiry;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
} 
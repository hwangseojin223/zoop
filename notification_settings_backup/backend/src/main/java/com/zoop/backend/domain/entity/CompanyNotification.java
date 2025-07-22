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
@Table(name = "company_notification")
@Schema(description="기업회원 알림 정보를 나타내는 엔티티")
public class CompanyNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "company_notification_seq")
    @SequenceGenerator(name = "company_notification_seq", sequenceName = "COMPANY_NOTIFICATION_SEQ", allocationSize = 1)
    @Schema(description="알림 고유 ID", example="1", accessMode=Schema.AccessMode.READ_ONLY)
    private Long notificationId;

    @Column(name = "company_admin_id", nullable = false)
    @Schema(description="회사 관리자 ID", example="68")
    private Long companyAdminId;

    @Column(name = "notification_type", nullable = false)
    @Schema(description="알림 타입", example="INTERVIEW_ANALYSIS_COMPLETE, POST_EXPIRY, NEW_APPLICATION, MATCHED_CANDIDATE, PORTFOLIO_ANALYSIS_COMPLETE")
    private String notificationType;

    @Column(name = "notification_title", nullable = false)
    @Schema(description="알림 제목", example="면접 분석 완료")
    private String notificationTitle;

    @Column(name = "notification_message", nullable = false)
    @Schema(description="알림 메시지", example="김철수님의 면접 분석이 완료되었습니다.")
    private String notificationMessage;

    @Column(name = "related_post_id")
    @Schema(description="관련 공고 ID", example="201")
    private Long relatedPostId;

    @Column(name = "related_candidate_id")
    @Schema(description="관련 후보자 ID", example="101")
    private Long relatedCandidateId;

    @Column(name = "related_interview_id")
    @Schema(description="관련 면접 ID", example="301")
    private Long relatedInterviewId;

    @Column(name = "is_read", nullable = false)
    @Schema(description="읽음 여부", example="false")
    private boolean isRead = false;

    @Column(name = "created_at", nullable = false)
    @Schema(description="알림 생성 시각")
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.isRead = false;
    }

    // Getters and Setters
    public Long getNotificationId() {
        return notificationId;
    }

    public void setNotificationId(Long notificationId) {
        this.notificationId = notificationId;
    }

    public Long getCompanyAdminId() {
        return companyAdminId;
    }

    public void setCompanyAdminId(Long companyAdminId) {
        this.companyAdminId = companyAdminId;
    }

    public String getNotificationType() {
        return notificationType;
    }

    public void setNotificationType(String notificationType) {
        this.notificationType = notificationType;
    }

    public String getNotificationTitle() {
        return notificationTitle;
    }

    public void setNotificationTitle(String notificationTitle) {
        this.notificationTitle = notificationTitle;
    }

    public String getNotificationMessage() {
        return notificationMessage;
    }

    public void setNotificationMessage(String notificationMessage) {
        this.notificationMessage = notificationMessage;
    }

    public Long getRelatedPostId() {
        return relatedPostId;
    }

    public void setRelatedPostId(Long relatedPostId) {
        this.relatedPostId = relatedPostId;
    }

    public Long getRelatedCandidateId() {
        return relatedCandidateId;
    }

    public void setRelatedCandidateId(Long relatedCandidateId) {
        this.relatedCandidateId = relatedCandidateId;
    }

    public Long getRelatedInterviewId() {
        return relatedInterviewId;
    }

    public void setRelatedInterviewId(Long relatedInterviewId) {
        this.relatedInterviewId = relatedInterviewId;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean isRead) {
        this.isRead = isRead;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
} 
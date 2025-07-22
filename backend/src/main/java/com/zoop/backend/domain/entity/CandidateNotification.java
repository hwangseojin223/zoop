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
@Table(name = "CANDIDATE_NOTIFICATION")
@Schema(description="개인회원 알림 정보를 나타내는 엔티티")
public class CandidateNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "NOTIFICATION_ID")
    @Schema(description="알림 고유 ID", example="1", accessMode=Schema.AccessMode.READ_ONLY)
    private Long notificationId;

    @Column(name = "CANDIDATE_ID", nullable = false)
    @Schema(description="후보자 ID", example="101")
    private Long candidateId;

    @Column(name = "NOTIFICATION_TYPE", nullable = false)
    @Schema(description="알림 타입", example="INTERVIEW_ACCEPTED, FINAL_RESULT, INTERVIEW_SOON, COMPANY_MATCHED")
    private String notificationType;

    @Column(name = "NOTIFICATION_TITLE", nullable = false)
    @Schema(description="알림 제목", example="면접 수락")
    private String notificationTitle;

    @Column(name = "NOTIFICATION_MESSAGE", nullable = false)
    @Schema(description="알림 메시지", example="ABC기업에서 면접을 수락했습니다.")
    private String notificationMessage;

    @Column(name = "RELATED_POST_ID")
    @Schema(description="관련 공고 ID", example="201")
    private Long relatedPostId;

    @Column(name = "RELATED_COMPANY_ID")
    @Schema(description="관련 기업 ID", example="68")
    private Long relatedCompanyId;

    @Column(name = "RELATED_INTERVIEW_ID")
    @Schema(description="관련 면접 ID", example="301")
    private Long relatedInterviewId;

    @Column(name = "IS_READ", nullable = false)
    @Schema(description="읽음 여부", example="false")
    private boolean isRead = false;

    @Column(name = "CREATED_AT", nullable = false)
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

    public Long getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(Long candidateId) {
        this.candidateId = candidateId;
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

    public Long getRelatedCompanyId() {
        return relatedCompanyId;
    }

    public void setRelatedCompanyId(Long relatedCompanyId) {
        this.relatedCompanyId = relatedCompanyId;
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
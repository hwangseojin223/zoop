package com.zoop.backend.domain.dto;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description="기업회원 알림 정보를 나타내는 DTO")
public class CompanyNotificationDto {

    @Schema(description="알림 고유 ID", example="1")
    private Long notificationId;

    @Schema(description="알림 타입", example="INTERVIEW_ANALYSIS_COMPLETE, POST_EXPIRY, NEW_APPLICATION, MATCHED_CANDIDATE, PORTFOLIO_ANALYSIS_COMPLETE")
    private String notificationType;

    @Schema(description="알림 제목", example="면접 분석 완료")
    private String notificationTitle;

    @Schema(description="알림 메시지", example="김철수님의 면접 분석이 완료되었습니다.")
    private String notificationMessage;

    @Schema(description="관련 공고 ID", example="201")
    private Long relatedPostId;

    @Schema(description="관련 후보자 ID", example="101")
    private Long relatedCandidateId;

    @Schema(description="관련 면접 ID", example="301")
    private Long relatedInterviewId;

    @Schema(description="읽음 여부", example="false")
    private boolean isRead;

    @Schema(description="알림 생성 시각")
    private LocalDateTime createdAt;

    @Schema(description="공고 제목", example="Java 개발자 채용")
    private String postTitle;

    @Schema(description="후보자명", example="김철수")
    private String candidateName;

    @Schema(description="기업명", example="ABC기업")
    private String companyName;
} 
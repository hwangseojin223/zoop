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
@Schema(description="개인회원 알림 정보를 나타내는 DTO")
public class CandidateNotificationDto {

    @Schema(description="알림 고유 ID", example="1")
    private Long notificationId;

    @Schema(description="알림 타입", example="INTERVIEW_ACCEPTED, FINAL_RESULT, INTERVIEW_SOON, COMPANY_MATCHED")
    private String notificationType;

    @Schema(description="알림 제목", example="면접 수락")
    private String notificationTitle;

    @Schema(description="알림 메시지", example="ABC기업에서 면접을 수락했습니다.")
    private String notificationMessage;

    @Schema(description="관련 공고 ID", example="201")
    private Long relatedPostId;

    @Schema(description="관련 기업 ID", example="68")
    private Long relatedCompanyId;

    @Schema(description="관련 면접 ID", example="301")
    private Long relatedInterviewId;

    @Schema(description="읽음 여부", example="false")
    private boolean isRead;

    @Schema(description="알림 생성 시각")
    private LocalDateTime createdAt;

    @Schema(description="공고 제목", example="Java 개발자 채용")
    private String postTitle;

    @Schema(description="기업명", example="ABC기업")
    private String companyName;

    @Schema(description="후보자명", example="김철수")
    private String candidateName;
} 
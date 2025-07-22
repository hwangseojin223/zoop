package com.zoop.backend.domain.dto;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description="기업회원 알림 설정 DTO")
public class CompanyNotificationSettingsDto {

    @Schema(description="설정 고유 ID", example="1")
    private Long settingId;

    @Schema(description="회사 관리자 ID", example="68")
    private Long companyAdminId;

    @Schema(description="이메일 알림 활성화 여부", example="true")
    private boolean emailNotifications;

    @Schema(description="푸시 알림 활성화 여부", example="true")
    private boolean pushNotifications;

    @Schema(description="주간 리포트 활성화 여부", example="false")
    private boolean weeklyReports;

    @Schema(description="후보자 업데이트 알림 활성화 여부", example="true")
    private boolean candidateUpdates;

    @Schema(description="새 지원자 알림 활성화 여부", example="true")
    private boolean newApplications;

    @Schema(description="면접 분석 완료 알림 활성화 여부", example="true")
    private boolean interviewAnalysis;

    @Schema(description="포트폴리오 매칭 알림 활성화 여부", example="true")
    private boolean portfolioMatching;

    @Schema(description="공고 마감 임박 알림 활성화 여부", example="true")
    private boolean postExpiry;

    @Schema(description="설정 생성 시각")
    private LocalDateTime createdAt;

    @Schema(description="설정 수정 시각")
    private LocalDateTime updatedAt;
} 
package com.zoop.backend.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.zoop.backend.domain.dto.CompanyNotificationSettingsDto;
import com.zoop.backend.domain.entity.CompanyNotificationSettings;
import com.zoop.backend.repository.CompanyNotificationSettingsRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyNotificationSettingsService {

    private final CompanyNotificationSettingsRepository settingsRepository;

    /**
     * 회사 관리자의 알림 설정 조회
     */
    public CompanyNotificationSettingsDto getNotificationSettings(Long companyAdminId) {
        log.info("🔍 회사 관리자 ID {}의 알림 설정 조회", companyAdminId);
        
        Optional<CompanyNotificationSettings> settings = settingsRepository.findByCompanyAdminId(companyAdminId);
        
        if (settings.isPresent()) {
            return convertToDto(settings.get());
        } else {
            // 기본 설정 반환
            return createDefaultSettings(companyAdminId);
        }
    }

    /**
     * 회사 관리자의 알림 설정 저장/수정
     */
    public CompanyNotificationSettingsDto saveNotificationSettings(Long companyAdminId, Map<String, Boolean> settings) {
        log.info("💾 회사 관리자 ID {}의 알림 설정 저장", companyAdminId);
        
        CompanyNotificationSettings notificationSettings = settingsRepository.findByCompanyAdminId(companyAdminId)
            .orElse(new CompanyNotificationSettings());
        
        // 설정값 업데이트
        notificationSettings.setCompanyAdminId(companyAdminId);
        notificationSettings.setEmailNotifications(settings.getOrDefault("emailNotifications", true));
        notificationSettings.setPushNotifications(settings.getOrDefault("pushNotifications", true));
        notificationSettings.setWeeklyReports(settings.getOrDefault("weeklyReports", false));
        notificationSettings.setCandidateUpdates(settings.getOrDefault("candidateUpdates", true));
        notificationSettings.setNewApplications(settings.getOrDefault("newApplications", true));
        notificationSettings.setInterviewAnalysis(settings.getOrDefault("interviewAnalysis", true));
        notificationSettings.setPortfolioMatching(settings.getOrDefault("portfolioMatching", true));
        notificationSettings.setPostExpiry(settings.getOrDefault("postExpiry", true));
        
        // 수정 시간 업데이트
        notificationSettings.onUpdate();
        
        CompanyNotificationSettings savedSettings = settingsRepository.save(notificationSettings);
        log.info("✅ 알림 설정 저장 완료: settingId={}", savedSettings.getSettingId());
        
        return convertToDto(savedSettings);
    }

    /**
     * 특정 알림 타입이 활성화되어 있는지 확인
     */
    public boolean isNotificationEnabled(Long companyAdminId, String notificationType) {
        Optional<CompanyNotificationSettings> settings = settingsRepository.findByCompanyAdminId(companyAdminId);
        
        if (settings.isEmpty()) {
            // 기본값: 모든 알림 활성화
            return true;
        }
        
        CompanyNotificationSettings setting = settings.get();
        
        switch (notificationType) {
            case "EMAIL":
                return setting.isEmailNotifications();
            case "PUSH":
                return setting.isPushNotifications();
            case "WEEKLY_REPORTS":
                return setting.isWeeklyReports();
            case "CANDIDATE_UPDATES":
                return setting.isCandidateUpdates();
            case "NEW_APPLICATIONS":
                return setting.isNewApplications();
            case "INTERVIEW_ANALYSIS":
                return setting.isInterviewAnalysis();
            case "PORTFOLIO_MATCHING":
                return setting.isPortfolioMatching();
            case "POST_EXPIRY":
                return setting.isPostExpiry();
            default:
                return true; // 알 수 없는 타입은 기본적으로 활성화
        }
    }

    /**
     * 기본 알림 설정 생성
     */
    private CompanyNotificationSettingsDto createDefaultSettings(Long companyAdminId) {
        log.info("📝 회사 관리자 ID {}의 기본 알림 설정 생성", companyAdminId);
        
        CompanyNotificationSettings defaultSettings = new CompanyNotificationSettings();
        defaultSettings.setCompanyAdminId(companyAdminId);
        defaultSettings.setEmailNotifications(true);
        defaultSettings.setPushNotifications(true);
        defaultSettings.setWeeklyReports(false);
        defaultSettings.setCandidateUpdates(true);
        defaultSettings.setNewApplications(true);
        defaultSettings.setInterviewAnalysis(true);
        defaultSettings.setPortfolioMatching(true);
        defaultSettings.setPostExpiry(true);
        
        CompanyNotificationSettings savedSettings = settingsRepository.save(defaultSettings);
        return convertToDto(savedSettings);
    }

    /**
     * 엔티티를 DTO로 변환
     */
    private CompanyNotificationSettingsDto convertToDto(CompanyNotificationSettings settings) {
        return CompanyNotificationSettingsDto.builder()
            .settingId(settings.getSettingId())
            .companyAdminId(settings.getCompanyAdminId())
            .emailNotifications(settings.isEmailNotifications())
            .pushNotifications(settings.isPushNotifications())
            .weeklyReports(settings.isWeeklyReports())
            .candidateUpdates(settings.isCandidateUpdates())
            .newApplications(settings.isNewApplications())
            .interviewAnalysis(settings.isInterviewAnalysis())
            .portfolioMatching(settings.isPortfolioMatching())
            .postExpiry(settings.isPostExpiry())
            .createdAt(settings.getCreatedAt())
            .updatedAt(settings.getUpdatedAt())
            .build();
    }
} 
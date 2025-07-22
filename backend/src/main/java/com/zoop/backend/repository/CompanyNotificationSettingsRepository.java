package com.zoop.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.zoop.backend.domain.entity.CompanyNotificationSettings;

@Repository
public interface CompanyNotificationSettingsRepository extends JpaRepository<CompanyNotificationSettings, Long> {

    /**
     * 회사 관리자 ID로 알림 설정 조회
     */
    Optional<CompanyNotificationSettings> findByCompanyAdminId(Long companyAdminId);

    /**
     * 회사 관리자 ID로 알림 설정 존재 여부 확인
     */
    boolean existsByCompanyAdminId(Long companyAdminId);

    /**
     * 회사 관리자 ID로 알림 설정 삭제
     */
    @Modifying
    @Query("DELETE FROM CompanyNotificationSettings s WHERE s.companyAdminId = :companyAdminId")
    void deleteByCompanyAdminId(@Param("companyAdminId") Long companyAdminId);
} 
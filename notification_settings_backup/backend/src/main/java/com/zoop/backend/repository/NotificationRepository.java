package com.zoop.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.zoop.backend.domain.entity.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // 회사 관리자별 알림 조회 (최신순)
    List<Notification> findByCompanyAdminIdOrderByCreatedAtDesc(Long companyAdminId);
    
    // 회사 관리자별 읽지 않은 알림 개수
    long countByCompanyAdminIdAndIsReadFalse(Long companyAdminId);
    
    // 회사 관리자별 최근 30일 알림 조회
    @Query("SELECT n FROM Notification n WHERE n.companyAdminId = :companyAdminId AND n.createdAt >= :thirtyDaysAgo ORDER BY n.createdAt DESC")
    List<Notification> findRecentNotificationsByCompanyAdminId(@Param("companyAdminId") Long companyAdminId, @Param("thirtyDaysAgo") LocalDateTime thirtyDaysAgo);
    
    // 특정 공고 관련 알림 조회
    List<Notification> findByRelatedPostIdOrderByCreatedAtDesc(Long postId);
    
    // 알림 읽음 처리
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.notificationId = :notificationId")
    void markAsRead(@Param("notificationId") Long notificationId);
    
    // 회사 관리자별 모든 알림 읽음 처리
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.companyAdminId = :companyAdminId")
    void markAllAsReadByCompanyAdminId(@Param("companyAdminId") Long companyAdminId);
    
    // 오래된 알림 삭제 (30일 이상)
    @Modifying
    @Transactional
    @Query("DELETE FROM Notification n WHERE n.createdAt < :cutoffDate")
    void deleteOldNotifications(@Param("cutoffDate") LocalDateTime cutoffDate);
} 
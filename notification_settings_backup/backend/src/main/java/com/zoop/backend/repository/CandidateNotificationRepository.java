package com.zoop.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.zoop.backend.domain.entity.CandidateNotification;

public interface CandidateNotificationRepository extends JpaRepository<CandidateNotification, Long> {
    
    // 후보자별 알림 조회 (최신순)
    List<CandidateNotification> findByCandidateIdOrderByCreatedAtDesc(Long candidateId);
    
    // 후보자별 읽지 않은 알림 개수
    long countByCandidateIdAndIsReadFalse(Long candidateId);
    
    // 후보자별 최근 30일 알림 조회
    @Query("SELECT n FROM CandidateNotification n WHERE n.candidateId = :candidateId AND n.createdAt >= :thirtyDaysAgo ORDER BY n.createdAt DESC")
    List<CandidateNotification> findRecentNotificationsByCandidateId(@Param("candidateId") Long candidateId, @Param("thirtyDaysAgo") LocalDateTime thirtyDaysAgo);
    
    // 특정 공고 관련 알림 조회
    List<CandidateNotification> findByRelatedPostIdOrderByCreatedAtDesc(Long postId);
    
    // 특정 기업 관련 알림 조회
    List<CandidateNotification> findByRelatedCompanyIdOrderByCreatedAtDesc(Long companyId);
    
    // 특정 면접 관련 알림 조회
    List<CandidateNotification> findByRelatedInterviewIdOrderByCreatedAtDesc(Long interviewId);
    
    // 알림 읽음 처리
    @Modifying
    @Transactional
    @Query("UPDATE CandidateNotification n SET n.isRead = true WHERE n.notificationId = :notificationId")
    void markAsRead(@Param("notificationId") Long notificationId);
    
    // 후보자별 모든 알림 읽음 처리
    @Modifying
    @Transactional
    @Query("UPDATE CandidateNotification n SET n.isRead = true WHERE n.candidateId = :candidateId")
    void markAllAsReadByCandidateId(@Param("candidateId") Long candidateId);
    
    // 오래된 알림 삭제 (30일 이상)
    @Modifying
    @Transactional
    @Query("DELETE FROM CandidateNotification n WHERE n.createdAt < :cutoffDate")
    void deleteOldNotifications(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    // 특정 후보자의 특정 타입 알림이 특정 시간 이후에 존재하는지 확인 (중복 방지용)
    @Query("SELECT COUNT(n) > 0 FROM CandidateNotification n WHERE n.candidateId = :candidateId AND n.notificationType = :notificationType AND n.createdAt >= :afterTime")
    boolean existsByCandidateIdAndNotificationTypeAndCreatedAtAfter(@Param("candidateId") Long candidateId, @Param("notificationType") String notificationType, @Param("afterTime") LocalDateTime afterTime);
} 
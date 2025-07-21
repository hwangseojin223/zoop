package com.zoop.backend.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.zoop.backend.repository.InterviewQuestionRepository;

import lombok.extern.slf4j.Slf4j;

/**
 * 면접 예상질문 자동 정리 스케줄러
 * 면접 마감시간이 지난 질문들을 주기적으로 삭제하여 DB 용량 관리
 */
@Component
@Slf4j
public class InterviewQuestionScheduler {

    @Autowired
    private InterviewQuestionRepository interviewQuestionRepository;

    /**
     * 면접 마감시간이 지난 예상질문들을 자동 삭제
     * 매 6시간마다 실행 (00:00, 06:00, 12:00, 18:00)
     */
    @Scheduled(cron = "0 0 */6 * * *")
    // 테스트용: 30초마다
    // @Scheduled(cron = "*/30 * * * * *")
    public void deleteExpiredQuestions() {
        try {
            LocalDateTime now = LocalDateTime.now();
            log.info("만료된 면접 예상질문 정리 작업 시작: {}", now);
            
            // 면접 마감시간이 지난 질문들 삭제
            int deletedCount = interviewQuestionRepository.deleteExpiredQuestions(now);
            
            if (deletedCount > 0) {
                log.info("만료된 면접 예상질문 {}개 자동 삭제 완료", deletedCount);
            } else {
                log.debug("삭제할 만료된 면접 예상질문이 없습니다");
            }
            
        } catch (Exception e) {
            log.error("면접 예상질문 자동 삭제 중 오류 발생: {}", e.getMessage(), e);
            // 배치 작업 실패해도 시스템 전체에 영향 주지 않도록 예외 처리만 하고 계속 진행
        }
    }

    /**
     * 수동 정리 작업 (관리자용)
     * 필요 시 관리자가 직접 호출할 수 있는 메서드
     */
    public int manualCleanup() {
        try {
            LocalDateTime now = LocalDateTime.now();
            log.info("수동 면접 예상질문 정리 작업 시작: {}", now);
            
            int deletedCount = interviewQuestionRepository.deleteExpiredQuestions(now);
            log.info("수동 정리 완료: {}개 질문 삭제", deletedCount);
            
            return deletedCount;
            
        } catch (Exception e) {
            log.error("수동 정리 작업 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("면접 예상질문 정리 실패", e);
        }
    }
} 
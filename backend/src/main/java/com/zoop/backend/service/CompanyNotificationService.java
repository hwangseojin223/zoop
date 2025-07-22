package com.zoop.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zoop.backend.domain.dto.CompanyNotificationDto;
import com.zoop.backend.domain.entity.CompanyNotification;
import com.zoop.backend.domain.entity.Post;
import com.zoop.backend.domain.entity.Candidate;
import com.zoop.backend.domain.entity.CompanyAdmin;
import com.zoop.backend.repository.CompanyNotificationRepository;
import com.zoop.backend.repository.PostRepository;
import com.zoop.backend.repository.CandidateRepository;
import com.zoop.backend.repository.CompanyAdminRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyNotificationService {

    private final CompanyNotificationRepository companyNotificationRepository;
    private final PostRepository postRepository;
    private final CandidateRepository candidateRepository;
    private final CompanyAdminRepository companyAdminRepository;

    /**
     * 회사 관리자별 알림 조회
     */
    @Transactional(readOnly = true)
    public List<CompanyNotificationDto> getNotificationsByCompanyAdminId(Long companyAdminId) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<CompanyNotification> notifications = companyNotificationRepository.findRecentNotificationsByCompanyAdminId(companyAdminId, thirtyDaysAgo);
        
        return notifications.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * 읽지 않은 알림 개수 조회
     */
    @Transactional(readOnly = true)
    public long getUnreadNotificationCount(Long companyAdminId) {
        return companyNotificationRepository.countByCompanyAdminIdAndIsReadFalse(companyAdminId);
    }

    /**
     * 알림 읽음 처리
     */
    @Transactional
    public void markNotificationAsRead(Long notificationId) {
        companyNotificationRepository.markAsRead(notificationId);
    }

    /**
     * 모든 알림 읽음 처리
     */
    @Transactional
    public void markAllNotificationsAsRead(Long companyAdminId) {
        companyNotificationRepository.markAllAsReadByCompanyAdminId(companyAdminId);
    }

    /**
     * 면접 분석 완료 알림 생성
     */
    @Transactional
    public void createInterviewAnalysisCompleteNotification(Long companyAdminId, Long candidateId, Long interviewId) {
        try {
            Candidate candidate = candidateRepository.findById(candidateId).orElse(null);
            
            if (candidate != null) {
                CompanyNotification notification = new CompanyNotification();
                notification.setCompanyAdminId(companyAdminId);
                notification.setNotificationType("INTERVIEW_ANALYSIS_COMPLETE");
                notification.setNotificationTitle("면접 분석 완료");
                notification.setNotificationMessage(String.format("%s님의 면접 분석이 완료되었습니다. 결과를 확인해보세요.", 
                    candidate.getCandidateName()));
                notification.setRelatedCandidateId(candidateId);
                notification.setRelatedInterviewId(interviewId);
                
                companyNotificationRepository.save(notification);
                log.info("면접 분석 완료 알림 생성: companyAdminId={}, candidateId={}, interviewId={}", 
                    companyAdminId, candidateId, interviewId);
            }
        } catch (Exception e) {
            log.error("면접 분석 완료 알림 생성 실패: {}", e.getMessage(), e);
        }
    }

    /**
     * 새로운 지원자 알림 생성
     */
    @Transactional
    public void createNewApplicationNotification(Long companyAdminId, Long postId, Long candidateId) {
        log.info("=== 새로운 지원자 알림 생성 시작 ===");
        log.info("companyAdminId: {}, postId: {}, candidateId: {}", companyAdminId, postId, candidateId);
        
        try {
            Post post = postRepository.findById(postId).orElse(null);
            Candidate candidate = candidateRepository.findById(candidateId).orElse(null);

            log.info("Post 조회 결과: {}", post != null ? "성공" : "실패");
            log.info("Candidate 조회 결과: {}", candidate != null ? "성공" : "실패");
            
            if (post != null) {
                log.info("Post 정보 - ID: {}, 제목: {}, companyAdminId: {}", 
                    post.getPostId(), post.getPostTitle(), post.getCompanyAdminId());
            }
            
            if (candidate != null) {
                log.info("Candidate 정보 - ID: {}, 이름: {}, 이메일: {}", 
                    candidate.getCandidateId(), candidate.getCandidateName(), candidate.getCandidateEmail());
            }

            if (post != null && candidate != null) {
                CompanyNotification notification = new CompanyNotification();
                notification.setCompanyAdminId(companyAdminId);
                notification.setNotificationType("NEW_APPLICATION");
                notification.setNotificationTitle("새로운 지원자");
                notification.setNotificationMessage(String.format("'%s' 공고에 %s님이 지원했습니다.", 
                    post.getPostTitle(), candidate.getCandidateName()));
                notification.setRelatedPostId(postId);
                notification.setRelatedCandidateId(candidateId);
                
                log.info("알림 객체 생성 완료:");
                log.info("- companyAdminId: {}", notification.getCompanyAdminId());
                log.info("- notificationType: {}", notification.getNotificationType());
                log.info("- notificationTitle: {}", notification.getNotificationTitle());
                log.info("- notificationMessage: {}", notification.getNotificationMessage());
                log.info("- relatedPostId: {}", notification.getRelatedPostId());
                log.info("- relatedCandidateId: {}", notification.getRelatedCandidateId());
                log.info("알림 저장 시도...");
                
                CompanyNotification savedNotification = companyNotificationRepository.save(notification);
                
                log.info("알림 저장 성공! 저장된 알림 ID: {}", savedNotification.getNotificationId());
                log.info("새로운 지원자 알림 생성 완료: companyAdminId={}, postId={}, candidateId={}", 
                    companyAdminId, postId, candidateId);
            } else {
                log.warn("Post 또는 Candidate가 null입니다. 알림 생성 중단.");
                if (post == null) {
                    log.warn("Post가 null입니다. postId: {}", postId);
                }
                if (candidate == null) {
                    log.warn("Candidate가 null입니다. candidateId: {}", candidateId);
                }
            }
        } catch (Exception e) {
            log.error("새로운 지원자 알림 생성 실패: {}", e.getMessage(), e);
            throw e; // 예외를 다시 던져서 호출자에게 알림
        }
    }

    /**
     * 매칭 지원자 알림 생성 (깃허브 추천자 회신)
     */
    @Transactional
    public void createMatchedCandidateNotification(Long companyAdminId, Long postId, Long candidateId) {
        try {
            log.info("매칭 지원자 알림 생성: companyAdminId={}, postId={}, candidateId={}", companyAdminId, postId, candidateId);
            
            String candidateName = candidateRepository.findById(candidateId)
                    .map(Candidate::getCandidateName)
                    .orElse("지원자");
            
            CompanyNotification notification = new CompanyNotification();
            notification.setCompanyAdminId(companyAdminId);
            notification.setNotificationType("MATCHED_CANDIDATE");
            notification.setNotificationTitle("매칭 지원자 발견");
            notification.setNotificationMessage(String.format("'%s'님이 공고와 매칭되었습니다.", candidateName));
            notification.setRelatedPostId(postId);
            notification.setRelatedCandidateId(candidateId);
            
            companyNotificationRepository.save(notification);
            log.info("매칭 지원자 알림 생성 완료");
        } catch (Exception e) {
            log.error("매칭 지원자 알림 생성 실패: {}", e.getMessage(), e);
        }
    }

    /**
     * 포트폴리오 분석 완료 알림 생성
     */
    @Transactional
    public void createPortfolioAnalysisCompleteNotification(Long companyAdminId, Long candidateId) {
        try {
            log.info("포트폴리오 분석 완료 알림 생성: companyAdminId={}, candidateId={}", companyAdminId, candidateId);
            
            CompanyNotification notification = new CompanyNotification();
            notification.setCompanyAdminId(companyAdminId);
            notification.setNotificationType("PORTFOLIO_ANALYSIS_COMPLETE");
            notification.setNotificationTitle("포트폴리오 분석 완료");
            notification.setNotificationMessage("포트폴리오 분석이 완료되었습니다. 분석 결과를 확인해보세요.");
            notification.setRelatedCandidateId(candidateId);
            
            companyNotificationRepository.save(notification);
            log.info("포트폴리오 분석 완료 알림 생성 완료");
        } catch (Exception e) {
            log.error("포트폴리오 분석 완료 알림 생성 실패: {}", e.getMessage(), e);
        }
    }

    /**
     * 메일 회신 알림 생성
     */
    @Transactional
    public void createEmailResponseNotification(Long companyAdminId, Long postId, Long candidateId) {
        try {
            log.info("메일 회신 알림 생성: companyAdminId={}, postId={}, candidateId={}", companyAdminId, postId, candidateId);
            
            String candidateName = candidateRepository.findById(candidateId)
                    .map(Candidate::getCandidateName)
                    .orElse("지원자");
            
            CompanyNotification notification = new CompanyNotification();
            notification.setCompanyAdminId(companyAdminId);
            notification.setNotificationType("EMAIL_RESPONSE");
            notification.setNotificationTitle("메일 회신");
            notification.setNotificationMessage(String.format("'%s'님이 메일에 회신했습니다.", candidateName));
            notification.setRelatedPostId(postId);
            notification.setRelatedCandidateId(candidateId);
            
            companyNotificationRepository.save(notification);
            log.info("메일 회신 알림 생성 완료");
        } catch (Exception e) {
            log.error("메일 회신 알림 생성 실패: {}", e.getMessage(), e);
        }
    }

    /**
     * 면접 일정 알림 생성
     */
    @Transactional
    public void createInterviewScheduledNotification(Long companyAdminId, Long postId, Long candidateId) {
        try {
            log.info("면접 일정 알림 생성: companyAdminId={}, postId={}, candidateId={}", companyAdminId, postId, candidateId);
            
            String candidateName = candidateRepository.findById(candidateId)
                    .map(Candidate::getCandidateName)
                    .orElse("지원자");
            
            CompanyNotification notification = new CompanyNotification();
            notification.setCompanyAdminId(companyAdminId);
            notification.setNotificationType("INTERVIEW_SCHEDULED");
            notification.setNotificationTitle("면접 일정 확정");
            notification.setNotificationMessage(String.format("'%s'님의 면접 일정이 확정되었습니다.", candidateName));
            notification.setRelatedPostId(postId);
            notification.setRelatedCandidateId(candidateId);
            
            companyNotificationRepository.save(notification);
            log.info("면접 일정 알림 생성 완료");
        } catch (Exception e) {
            log.error("면접 일정 알림 생성 실패: {}", e.getMessage(), e);
        }
    }

    /**
     * 면접 완료 알림 생성
     */
    @Transactional
    public void createInterviewCompletedNotification(Long companyAdminId, Long postId, Long candidateId) {
        try {
            log.info("면접 완료 알림 생성: companyAdminId={}, postId={}, candidateId={}", companyAdminId, postId, candidateId);
            
            String candidateName = candidateRepository.findById(candidateId)
                    .map(Candidate::getCandidateName)
                    .orElse("지원자");
            
            CompanyNotification notification = new CompanyNotification();
            notification.setCompanyAdminId(companyAdminId);
            notification.setNotificationType("INTERVIEW_COMPLETED");
            notification.setNotificationTitle("면접 완료");
            notification.setNotificationMessage(String.format("'%s'님의 면접이 완료되었습니다.", candidateName));
            notification.setRelatedPostId(postId);
            notification.setRelatedCandidateId(candidateId);
            
            companyNotificationRepository.save(notification);
            log.info("면접 완료 알림 생성 완료");
        } catch (Exception e) {
            log.error("면접 완료 알림 생성 실패: {}", e.getMessage(), e);
        }
    }

    /**
     * 최종 결과 알림 생성
     */
    @Transactional
    public void createFinalResultNotification(Long companyAdminId, Long postId, Long candidateId, boolean isAccepted) {
        try {
            log.info("최종 결과 알림 생성: companyAdminId={}, postId={}, candidateId={}, isAccepted={}", 
                companyAdminId, postId, candidateId, isAccepted);
            
            String candidateName = candidateRepository.findById(candidateId)
                    .map(Candidate::getCandidateName)
                    .orElse("지원자");
            
            String result = isAccepted ? "합격" : "불합격";
            String message = String.format("'%s'님의 최종 결과가 %s로 발표되었습니다.", candidateName, result);
            
            CompanyNotification notification = new CompanyNotification();
            notification.setCompanyAdminId(companyAdminId);
            notification.setNotificationType("FINAL_RESULT");
            notification.setNotificationTitle("최종 결과 발표");
            notification.setNotificationMessage(message);
            notification.setRelatedPostId(postId);
            notification.setRelatedCandidateId(candidateId);
            
            companyNotificationRepository.save(notification);
            log.info("최종 결과 알림 생성 완료");
        } catch (Exception e) {
            log.error("최종 결과 알림 생성 실패: {}", e.getMessage(), e);
        }
    }

    /**
     * 공고 마감 임박 알림 생성
     */
    @Transactional
    public void createPostExpiryNotification(Long companyAdminId, Long postId, int daysLeft) {
        try {
            Post post = postRepository.findById(postId).orElse(null);
            
            if (post != null) {
                String message;
                if (daysLeft == 0) {
                    message = String.format("'%s' 공고가 오늘 마감됩니다!", post.getPostTitle());
                } else {
                    message = String.format("'%s' 공고가 %d일 후 마감됩니다.", post.getPostTitle(), daysLeft);
                }
                
                CompanyNotification notification = new CompanyNotification();
                notification.setCompanyAdminId(companyAdminId);
                notification.setNotificationType("POST_EXPIRY");
                notification.setNotificationTitle("공고 마감 임박");
                notification.setNotificationMessage(message);
                notification.setRelatedPostId(postId);
                
                companyNotificationRepository.save(notification);
                log.info("공고 마감 임박 알림 생성: companyAdminId={}, postId={}, daysLeft={}", 
                    companyAdminId, postId, daysLeft);
            }
        } catch (Exception e) {
            log.error("공고 마감 임박 알림 생성 실패: {}", e.getMessage(), e);
        }
    }

    /**
     * 매일 자정에 공고 마감 임박 알림 생성 (스케줄러)
     */
    @Scheduled(cron = "0 0 0 * * ?") // 매일 자정
    @Transactional
    public void checkPostExpiryNotifications() {
        log.info("공고 마감 임박 알림 체크 시작");
        
        LocalDateTime now = LocalDateTime.now();
        List<Post> activePosts = postRepository.findByPostStatusOrderByPostCreatedAtDesc("OPEN");
        
        for (Post post : activePosts) {
            if (post.getPostExpiryDate() != null) {
                long daysUntilExpiry = java.time.Duration.between(now, post.getPostExpiryDate()).toDays();
                
                // 7일, 3일, 1일, 0일(오늘) 전에 알림 생성
                if (daysUntilExpiry == 7 || daysUntilExpiry == 3 || daysUntilExpiry == 1 || daysUntilExpiry == 0) {
                    // 이미 같은 날짜에 알림이 생성되었는지 확인
                    LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
                    LocalDateTime tomorrow = today.plusDays(1);
                    
                    boolean notificationExists = companyNotificationRepository.findByCompanyAdminIdOrderByCreatedAtDesc(post.getCompanyAdminId())
                            .stream()
                            .anyMatch(n -> n.getNotificationType().equals("POST_EXPIRY") && 
                                         n.getRelatedPostId().equals(post.getPostId()) &&
                                         n.getCreatedAt().isAfter(today) && 
                                         n.getCreatedAt().isBefore(tomorrow));
                    
                    if (!notificationExists) {
                        createPostExpiryNotification(post.getCompanyAdminId(), post.getPostId(), (int) daysUntilExpiry);
                    }
                }
            }
        }
        
        log.info("공고 마감 임박 알림 체크 완료");
    }

    /**
     * 30일 이상 된 알림 자동 삭제 (스케줄러)
     */
    @Scheduled(cron = "0 0 2 * * ?") // 매일 새벽 2시
    @Transactional
    public void cleanupOldNotifications() {
        log.info("오래된 기업 알림 정리 시작");
        
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        companyNotificationRepository.deleteOldNotifications(cutoffDate);
        
        log.info("오래된 기업 알림 정리 완료");
    }

    /**
     * 추가 지원자 알림 생성
     */
    @Transactional
    public void createAdditionalApplicantNotification(Long companyAdminId, Long postId, Long candidateId) {
        try {
            // 공고명, 지원자명 조회
            String postTitle = postRepository.findById(postId)
                .map(Post::getPostTitle)
                .orElse("알 수 없음");
            String candidateName = candidateRepository.findById(candidateId)
                .map(Candidate::getCandidateName)
                .orElse("알 수 없음");

            CompanyNotification notification = new CompanyNotification();
            notification.setCompanyAdminId(companyAdminId);
            notification.setNotificationType("ADDITIONAL_APPLICANT");
            notification.setNotificationTitle("추가 지원자 발생");
            notification.setNotificationMessage(
                String.format("'%s' 공고에 %s님이 추가 지원했습니다.", postTitle, candidateName)
            );
            notification.setRelatedPostId(postId);
            notification.setRelatedCandidateId(candidateId);
            companyNotificationRepository.save(notification);
        } catch (Exception e) {
            log.error("추가 지원자 알림 생성 실패: {}", e.getMessage(), e);
        }
    }

    /**
     * CompanyNotification 엔티티를 DTO로 변환
     */
    private CompanyNotificationDto convertToDto(CompanyNotification notification) {
        String postTitle = null;
        String candidateName = null;
        String companyName = null;
        
        if (notification.getRelatedPostId() != null) {
            postTitle = postRepository.findById(notification.getRelatedPostId())
                    .map(Post::getPostTitle)
                    .orElse(null);
        }
        
        if (notification.getRelatedCandidateId() != null) {
            candidateName = candidateRepository.findById(notification.getRelatedCandidateId())
                    .map(Candidate::getCandidateName)
                    .orElse(null);
        }
        
        if (notification.getCompanyAdminId() != null) {
            companyName = companyAdminRepository.findById(notification.getCompanyAdminId())
                    .map(admin -> admin.getCompany() != null ? admin.getCompany().getCompanyName() : null)
                    .orElse(null);
        }
        
        return CompanyNotificationDto.builder()
                .notificationId(notification.getNotificationId())
                .notificationType(notification.getNotificationType())
                .notificationTitle(notification.getNotificationTitle())
                .notificationMessage(notification.getNotificationMessage())
                .relatedPostId(notification.getRelatedPostId())
                .relatedCandidateId(notification.getRelatedCandidateId())
                .relatedInterviewId(notification.getRelatedInterviewId())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .postTitle(postTitle)
                .candidateName(candidateName)
                .companyName(companyName)
                .build();
    }
} 
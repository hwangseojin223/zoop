package com.zoop.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zoop.backend.domain.dto.CandidateNotificationDto;
import com.zoop.backend.domain.entity.CandidateNotification;
import com.zoop.backend.domain.entity.Post;
import com.zoop.backend.domain.entity.Candidate;
import com.zoop.backend.domain.entity.Company;
import com.zoop.backend.repository.CandidateNotificationRepository;
import com.zoop.backend.repository.PostRepository;
import com.zoop.backend.repository.CandidateRepository;
import com.zoop.backend.repository.CompanyRepository;
import com.zoop.backend.repository.JobCandProgressRepository;
import com.zoop.backend.repository.AiInterviewScheduleRepository;
import com.zoop.backend.domain.entity.JobCandProgress;
import com.zoop.backend.domain.entity.AiInterviewSchedule;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CandidateNotificationService {

    private final CandidateNotificationRepository candidateNotificationRepository;
    private final PostRepository postRepository;
    private final CandidateRepository candidateRepository;
    private final CompanyRepository companyRepository;
    private final JobCandProgressRepository jobCandProgressRepository;
    private final AiInterviewScheduleRepository aiInterviewScheduleRepository;

    /**
     * 후보자별 알림 조회
     */
    @Transactional(readOnly = true)
    public List<CandidateNotificationDto> getNotificationsByCandidateId(Long candidateId) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<CandidateNotification> notifications = candidateNotificationRepository.findRecentNotificationsByCandidateId(candidateId, thirtyDaysAgo);
        
        return notifications.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * 읽지 않은 알림 개수 조회
     */
    @Transactional(readOnly = true)
    public long getUnreadNotificationCount(Long candidateId) {
        return candidateNotificationRepository.countByCandidateIdAndIsReadFalse(candidateId);
    }

    /**
     * 알림 읽음 처리
     */
    @Transactional
    public void markNotificationAsRead(Long notificationId) {
        candidateNotificationRepository.markAsRead(notificationId);
    }

    /**
     * 모든 알림 읽음 처리
     */
    @Transactional
    public void markAllNotificationsAsRead(Long candidateId) {
        candidateNotificationRepository.markAllAsReadByCandidateId(candidateId);
    }

    /**
     * 면접 수락 알림 생성
     */
    @Transactional
    public void createInterviewAcceptedNotification(Long candidateId, Long postId, Long companyId, Long interviewId) {
        try {
            Post post = postRepository.findById(postId).orElse(null);
            Company company = companyRepository.findById(companyId).orElse(null);
            
            if (post != null && company != null) {
                CandidateNotification notification = new CandidateNotification();
                notification.setCandidateId(candidateId);
                notification.setNotificationType("INTERVIEW_ACCEPTED");
                notification.setNotificationTitle("면접 수락");
                notification.setNotificationMessage(String.format("%s에서 면접을 수락했습니다. 면접 일정을 확인해보세요.", 
                    company.getCompanyName()));
                notification.setRelatedPostId(postId);
                notification.setRelatedCompanyId(companyId);
                notification.setRelatedInterviewId(interviewId);
                
                candidateNotificationRepository.save(notification);
                log.info("면접 수락 알림 생성: candidateId={}, postId={}, companyId={}, interviewId={}", 
                    candidateId, postId, companyId, interviewId);
            }
        } catch (Exception e) {
            log.error("면접 수락 알림 생성 실패: {}", e.getMessage(), e);
        }
    }

    /**
     * 추가지원자 수락 알림 생성
     */
    @Transactional
    public void createAdditionalApplicantAcceptedNotification(Long candidateId, Long postId, Long companyId) {
        System.out.println("=== [CONSOLE] 추가지원자 수락 알림 생성 함수 진입 ===");
        System.out.println("candidateId: " + candidateId + ", postId: " + postId + ", companyId: " + companyId);
        
        log.info("=== [LOG] 추가지원자 수락 알림 생성 함수 진입: candidateId={}, postId={}, companyId={} ===", candidateId, postId, companyId);
        try {
            Post post = postRepository.findById(postId).orElse(null);
            Company company = companyRepository.findById(companyId).orElse(null);
            
            System.out.println("Post 조회 결과: " + (post != null ? "존재함 - " + post.getPostTitle() : "null"));
            System.out.println("Company 조회 결과: " + (company != null ? "존재함 - " + company.getCompanyName() : "null"));
            System.out.println("CandidateId 값: " + candidateId);
            
            log.info("Post 조회 결과: {}", post != null ? "존재함" : "null");
            log.info("Company 조회 결과: {}", company != null ? "존재함" : "null");
            log.info("CandidateId 값: {}", candidateId);
            
            if (post == null) {
                System.err.println("ERROR: post가 null입니다. postId=" + postId);
                log.error("post가 null입니다. postId={}", postId);
            }
            if (company == null) {
                System.err.println("ERROR: company가 null입니다. companyId=" + companyId);
                log.error("company가 null입니다. companyId={}", companyId);
            }
            if (candidateId == null) {
                System.err.println("ERROR: candidateId가 null입니다!");
                log.error("candidateId가 null입니다!");
            }
            
            if (post != null && company != null && candidateId != null) {
                System.out.println("=== 알림 객체 생성 시작 ===");
                
                CandidateNotification notification = new CandidateNotification();
                notification.setCandidateId(candidateId);
                notification.setNotificationType("ADDITIONAL_APPLICANT_ACCEPTED");
                notification.setNotificationTitle("지원 수락");
                notification.setNotificationMessage(String.format("%s에서 %s 공고에 대한 지원을 수락했습니다!", 
                    company.getCompanyName(), post.getPostTitle()));
                notification.setRelatedPostId(postId);
                notification.setRelatedCompanyId(companyId);
                
                System.out.println("알림 객체 생성 완료: " + notification.getNotificationMessage());
                System.out.println("candidateNotificationRepository.save() 직전");
                
                log.info("알림 객체 생성 완료: {}", notification);
                log.info("candidateNotificationRepository.save() 직전");
                
                CandidateNotification savedNotification = candidateNotificationRepository.save(notification);
                System.out.println("save() 호출 완료, flush() 호출 중...");
                candidateNotificationRepository.flush(); // 강제로 DB에 반영
                System.out.println("flush() 완료");
                
                log.info("candidateNotificationRepository.save() 완료");
                log.info("저장된 알림 ID: {}", savedNotification.getNotificationId());
                log.info("저장된 알림 내용: {}", savedNotification);
                
                System.out.println("저장된 알림 ID: " + savedNotification.getNotificationId());
                System.out.println("저장된 알림 내용: " + savedNotification.getNotificationMessage());
                
                // 저장 후 다시 조회해서 확인
                if (savedNotification.getNotificationId() != null) {
                    CandidateNotification retrievedNotification = candidateNotificationRepository.findById(savedNotification.getNotificationId()).orElse(null);
                    System.out.println("저장 후 재조회 결과: " + (retrievedNotification != null ? "존재함" : "null"));
                    log.info("저장 후 재조회 결과: {}", retrievedNotification != null ? "존재함" : "null");
                }
                
                System.out.println("=== 알림 생성 완료 ===");
                
            } else {
                System.err.println("ERROR: 알림 생성 조건 불충족");
                System.err.println("post 존재: " + (post != null));
                System.err.println("company 존재: " + (company != null)); 
                System.err.println("candidateId 존재: " + (candidateId != null));
                
                log.error("알림 생성 조건 불충족. post={}, company={}, candidateId={}", 
                    post != null, company != null, candidateId != null);
            }
        } catch (Exception e) {
            System.err.println("EXCEPTION: 추가지원자 수락 알림 생성 실패: " + e.getMessage());
            e.printStackTrace();
            log.error("추가지원자 수락 알림 생성 실패", e);
        }
    }

    /**
     * 최종 결과 알림 생성
     */
    @Transactional
    public void createFinalResultNotification(Long candidateId, Long postId, Long companyId, boolean isAccepted) {
        try {
            Post post = postRepository.findById(postId).orElse(null);
            Company company = companyRepository.findById(companyId).orElse(null);
            
            if (post != null && company != null) {
                String result = isAccepted ? "최종 합격" : "최종 불합격";
                String message = isAccepted ? 
                    String.format("%s %s 공고에 최종 합격하셨습니다!", company.getCompanyName(), post.getPostTitle()) :
                    String.format("%s %s 공고에 불합격하셨습니다.", company.getCompanyName(), post.getPostTitle());
                
                CandidateNotification notification = new CandidateNotification();
                notification.setCandidateId(candidateId);
                notification.setNotificationType("FINAL_RESULT");
                notification.setNotificationTitle(result);
                notification.setNotificationMessage(message);
                notification.setRelatedPostId(postId);
                notification.setRelatedCompanyId(companyId);
                
                candidateNotificationRepository.save(notification);
                log.info("최종 결과 알림 생성: candidateId={}, postId={}, companyId={}, isAccepted={}", 
                    candidateId, postId, companyId, isAccepted);
            }
        } catch (Exception e) {
            log.error("최종 결과 알림 생성 실패: {}", e.getMessage(), e);
        }
    }

    /**
     * 면접 임박 알림 생성
     */
    @Transactional
    public void createInterviewSoonNotification(Long candidateId, Long postId, Long companyId, Long interviewId, int minutesLeft) {
        try {
            Post post = postRepository.findById(postId).orElse(null);
            Company company = companyRepository.findById(companyId).orElse(null);
            
            if (post != null && company != null) {
                String timeMessage;
                if (minutesLeft < 60) {
                    timeMessage = String.format("%s 면접이 %d분 후에 시작됩니다.", company.getCompanyName(), minutesLeft);
                } else {
                    int hours = minutesLeft / 60;
                    int minutes = minutesLeft % 60;
                    timeMessage = String.format("%s 면접이 %d시간 %d분 후에 시작됩니다.", company.getCompanyName(), hours, minutes);
                }
                
                CandidateNotification notification = new CandidateNotification();
                notification.setCandidateId(candidateId);
                notification.setNotificationType("INTERVIEW_SOON");
                notification.setNotificationTitle("면접 임박");
                notification.setNotificationMessage(timeMessage);
                notification.setRelatedPostId(postId);
                notification.setRelatedCompanyId(companyId);
                notification.setRelatedInterviewId(interviewId);
                
                candidateNotificationRepository.save(notification);
                log.info("면접 임박 알림 생성: candidateId={}, postId={}, companyId={}, interviewId={}, minutesLeft={}", 
                    candidateId, postId, companyId, interviewId, minutesLeft);
            }
        } catch (Exception e) {
            log.error("면접 임박 알림 생성 실패: {}", e.getMessage(), e);
        }
    }

    /**
     * 기업 매칭 알림 생성
     */
    @Transactional
    public void createCompanyMatchedNotification(Long candidateId, Long postId, Long companyId) {
        try {
            Post post = postRepository.findById(postId).orElse(null);
            Company company = companyRepository.findById(companyId).orElse(null);
            
            if (post != null && company != null) {
                CandidateNotification notification = new CandidateNotification();
                notification.setCandidateId(candidateId);
                notification.setNotificationType("COMPANY_MATCHED");
                notification.setNotificationTitle("기업 매칭");
                notification.setNotificationMessage(String.format("%s와 매칭되었습니다. 지원서를 작성해보세요.", 
                    company.getCompanyName()));
                notification.setRelatedPostId(postId);
                notification.setRelatedCompanyId(companyId);
                
                candidateNotificationRepository.save(notification);
                log.info("기업 매칭 알림 생성: candidateId={}, postId={}, companyId={}", 
                    candidateId, postId, companyId);
            }
        } catch (Exception e) {
            log.error("기업 매칭 알림 생성 실패: {}", e.getMessage(), e);
        }
    }

    /**
     * 추가 지원 알림 생성 (후보자가 새로운 공고에 지원했을 때)
     */
    @Transactional
    public void createAdditionalApplicationNotification(Long candidateId, Long postId, Long companyId) {
        try {
            Post post = postRepository.findById(postId).orElse(null);
            Company company = companyRepository.findById(companyId).orElse(null);
            
            if (post != null && company != null) {
                CandidateNotification notification = new CandidateNotification();
                notification.setCandidateId(candidateId);
                notification.setNotificationType("ADDITIONAL_APPLICATION");
                notification.setNotificationTitle("추가 지원 완료");
                notification.setNotificationMessage(String.format("%s %s 공고에 추가 지원이 완료되었습니다.", 
                    company.getCompanyName(), post.getPostTitle()));
                notification.setRelatedPostId(postId);
                notification.setRelatedCompanyId(companyId);
                
                candidateNotificationRepository.save(notification);
                log.info("추가 지원 알림 생성: candidateId={}, postId={}, companyId={}", 
                    candidateId, postId, companyId);
            }
        } catch (Exception e) {
            log.error("추가 지원 알림 생성 실패: {}", e.getMessage(), e);
        }
    }

    /**
     * 하루 전 면접 알림 생성
     */
    @Transactional
    public void createInterviewDayBeforeNotification(Long candidateId, Long postId, Long companyId, Long interviewId) {
        try {
            Post post = postRepository.findById(postId).orElse(null);
            Company company = companyRepository.findById(companyId).orElse(null);
            
            if (post != null && company != null) {
                CandidateNotification notification = new CandidateNotification();
                notification.setCandidateId(candidateId);
                notification.setNotificationType("INTERVIEW_DAY_BEFORE");
                notification.setNotificationTitle("면접 하루 전");
                notification.setNotificationMessage(String.format("%s 면접이 내일 진행됩니다. 준비하세요!", 
                    company.getCompanyName()));
                notification.setRelatedPostId(postId);
                notification.setRelatedCompanyId(companyId);
                notification.setRelatedInterviewId(interviewId);
                
                candidateNotificationRepository.save(notification);
                log.info("하루 전 면접 알림 생성: candidateId={}, postId={}, companyId={}, interviewId={}", 
                    candidateId, postId, companyId, interviewId);
            }
        } catch (Exception e) {
            log.error("하루 전 면접 알림 생성 실패: {}", e.getMessage(), e);
        }
    }

    /**
     * 한 시간 전 면접 알림 생성
     */
    @Transactional
    public void createInterviewOneHourBeforeNotification(Long candidateId, Long postId, Long companyId, Long interviewId) {
        try {
            Post post = postRepository.findById(postId).orElse(null);
            Company company = companyRepository.findById(companyId).orElse(null);
            
            if (post != null && company != null) {
                CandidateNotification notification = new CandidateNotification();
                notification.setCandidateId(candidateId);
                notification.setNotificationType("INTERVIEW_ONE_HOUR_BEFORE");
                notification.setNotificationTitle("면접 1시간 전");
                notification.setNotificationMessage(String.format("%s 면접이 1시간 후에 시작됩니다. 링크를 확인하세요!", 
                    company.getCompanyName()));
                notification.setRelatedPostId(postId);
                notification.setRelatedCompanyId(companyId);
                notification.setRelatedInterviewId(interviewId);
                
                candidateNotificationRepository.save(notification);
                log.info("한 시간 전 면접 알림 생성: candidateId={}, postId={}, companyId={}, interviewId={}", 
                    candidateId, postId, companyId, interviewId);
            }
        } catch (Exception e) {
            log.error("한 시간 전 면접 알림 생성 실패: {}", e.getMessage(), e);
        }
    }

    /**
     * 테스트용 면접 알림 생성 (개발/테스트용)
     */
    @Transactional
    public void createTestInterviewNotification(Long candidateId, Long postId, Long companyId, Long interviewId) {
        try {
            Post post = postRepository.findById(postId).orElse(null);
            Company company = companyRepository.findById(companyId).orElse(null);
            
            if (post != null && company != null) {
                CandidateNotification notification = new CandidateNotification();
                notification.setCandidateId(candidateId);
                notification.setNotificationType("INTERVIEW_TEST");
                notification.setNotificationTitle("면접 알림 테스트");
                notification.setNotificationMessage(String.format("%s 면접 알림이 정상적으로 작동합니다!", 
                    company.getCompanyName()));
                notification.setRelatedPostId(postId);
                notification.setRelatedCompanyId(companyId);
                notification.setRelatedInterviewId(interviewId);
                
                candidateNotificationRepository.save(notification);
                log.info("테스트 면접 알림 생성: candidateId={}, postId={}, companyId={}, interviewId={}", 
                    candidateId, postId, companyId, interviewId);
            }
        } catch (Exception e) {
            log.error("테스트 면접 알림 생성 실패: {}", e.getMessage(), e);
        }
    }

    /**
     * GitHub 추천자 발견 알림 생성
     */
    @Transactional
    public void createGithubRecommendationNotification(Long candidateId, Long postId, Long companyId) {
        try {
            Post post = postRepository.findById(postId).orElse(null);
            Company company = companyRepository.findById(companyId).orElse(null);
            if (post != null && company != null) {
                CandidateNotification notification = new CandidateNotification();
                notification.setCandidateId(candidateId);
                notification.setNotificationType("GITHUB_RECOMMENDATION");
                notification.setNotificationTitle("깃허브 추천 후보자 발견");
                notification.setNotificationMessage(String.format("%s에서 %s 공고에 깃허브 추천 후보자로 등록되었습니다.", company.getCompanyName(), post.getPostTitle()));
                notification.setRelatedPostId(postId);
                notification.setRelatedCompanyId(companyId);
                candidateNotificationRepository.save(notification);
                log.info("깃허브 추천자 알림 생성: candidateId={}, postId={}, companyId={}", candidateId, postId, companyId);
            }
        } catch (Exception e) {
            log.error("깃허브 추천자 알림 생성 실패: {}", e.getMessage(), e);
        }
    }

    /**
     * 면접 초대 알림 생성
     */
    @Transactional
    public void createInterviewInvitationNotification(Long candidateId, Long postId, Long companyId) {
        try {
            Post post = postRepository.findById(postId).orElse(null);
            Company company = companyRepository.findById(companyId).orElse(null);
            if (post != null && company != null) {
                CandidateNotification notification = new CandidateNotification();
                notification.setCandidateId(candidateId);
                notification.setNotificationType("INTERVIEW_INVITATION");
                notification.setNotificationTitle("면접 초대");
                notification.setNotificationMessage(String.format("%s에서 %s 공고에 면접 초대가 도착했습니다.", company.getCompanyName(), post.getPostTitle()));
                notification.setRelatedPostId(postId);
                notification.setRelatedCompanyId(companyId);
                candidateNotificationRepository.save(notification);
                log.info("면접 초대 알림 생성: candidateId={}, postId={}, companyId={}", candidateId, postId, companyId);
            }
        } catch (Exception e) {
            log.error("면접 초대 알림 생성 실패: {}", e.getMessage(), e);
        }
    }

    /**
     * 포트폴리오 제출 완료 알림 생성
     */
    @Transactional
    public void createPortfolioSubmittedNotification(Long candidateId, Long postId, Long companyId) {
        try {
            Post post = postRepository.findById(postId).orElse(null);
            Company company = companyRepository.findById(companyId).orElse(null);
            if (post != null && company != null) {
                CandidateNotification notification = new CandidateNotification();
                notification.setCandidateId(candidateId);
                notification.setNotificationType("PORTFOLIO_SUBMITTED");
                notification.setNotificationTitle("포트폴리오 제출 완료");
                notification.setNotificationMessage(String.format("%s %s 공고에 포트폴리오가 제출되었습니다.", company.getCompanyName(), post.getPostTitle()));
                notification.setRelatedPostId(postId);
                notification.setRelatedCompanyId(companyId);
                candidateNotificationRepository.save(notification);
                log.info("포트폴리오 제출 알림 생성: candidateId={}, postId={}, companyId={}", candidateId, postId, companyId);
            }
        } catch (Exception e) {
            log.error("포트폴리오 제출 알림 생성 실패: {}", e.getMessage(), e);
        }
    }

    /**
     * 면접 일정 조정(스케줄) 알림 생성
     */
    @Transactional
    public void createInterviewScheduledNotification(Long candidateId, Long postId, Long companyId, Long interviewScheduleId) {
        try {
            Post post = postRepository.findById(postId).orElse(null);
            Company company = companyRepository.findById(companyId).orElse(null);
            if (post != null && company != null) {
                CandidateNotification notification = new CandidateNotification();
                notification.setCandidateId(candidateId);
                notification.setNotificationType("INTERVIEW_SCHEDULED");
                notification.setNotificationTitle("면접 일정 등록");
                notification.setNotificationMessage(String.format("%s %s 공고의 면접 일정이 등록되었습니다.", company.getCompanyName(), post.getPostTitle()));
                notification.setRelatedPostId(postId);
                notification.setRelatedCompanyId(companyId);
                notification.setRelatedInterviewId(interviewScheduleId);
                candidateNotificationRepository.save(notification);
                log.info("면접 일정 등록 알림 생성: candidateId={}, postId={}, companyId={}, interviewScheduleId={}", candidateId, postId, companyId, interviewScheduleId);
            }
        } catch (Exception e) {
            log.error("면접 일정 등록 알림 생성 실패: {}", e.getMessage(), e);
        }
    }

    @Transactional
    public void createAcceptedNotification(Long candidateId, Long postId, Long companyId) {
        try {
            CandidateNotification notification = new CandidateNotification();
            notification.setCandidateId(candidateId);
            notification.setNotificationType("ADDITIONAL_APPLICANT_ACCEPTED");
            notification.setNotificationTitle("추가 지원자 수락");
            notification.setNotificationMessage("기업에서 추가 지원자를 수락했습니다.");
            notification.setRelatedPostId(postId);
            notification.setRelatedCompanyId(companyId);
            candidateNotificationRepository.save(notification);
        } catch (Exception e) {
            log.error("추가 지원자 수락 알림 생성 실패: {}", e.getMessage(), e);
        }
    }

    @Transactional
    public void createRejectedNotification(Long candidateId, Long postId, Long companyId) {
        try {
            CandidateNotification notification = new CandidateNotification();
            notification.setCandidateId(candidateId);
            notification.setNotificationType("ADDITIONAL_APPLICANT_REJECTED");
            notification.setNotificationTitle("추가 지원자 거절");
            notification.setNotificationMessage("기업에서 추가 지원자를 거절했습니다.");
            notification.setRelatedPostId(postId);
            notification.setRelatedCompanyId(companyId);
            candidateNotificationRepository.save(notification);
        } catch (Exception e) {
            log.error("추가 지원자 거절 알림 생성 실패: {}", e.getMessage(), e);
        }
    }

    /**
     * 30일 이상 된 알림 자동 삭제 (스케줄러)
     */
    @Scheduled(cron = "0 0 2 * * ?") // 매일 새벽 2시
    @Transactional
    public void cleanupOldNotifications() {
        log.info("오래된 후보자 알림 정리 시작");
        
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        candidateNotificationRepository.deleteOldNotifications(cutoffDate);
        
        log.info("오래된 후보자 알림 정리 완료");
    }

    /**
     * 면접 임박 알림 스케줄러 (10분마다 실행)
     */
    @Scheduled(cron = "0 */10 * * * ?") // 10분마다 실행
    @Transactional
    public void checkUpcomingInterviews() {
        log.info("면접 임박 알림 체크 시작");
        
        try {
            LocalDateTime now = LocalDateTime.now();
            
            // 1. 하루 전 알림 (24시간 전)
            LocalDateTime oneDayFromNow = now.plusHours(24);
            LocalDateTime oneDayFromNowPlus1Hour = now.plusHours(25);
            
            // 2. 한 시간 전 알림
            LocalDateTime oneHourFromNow = now.plusHours(1);
            LocalDateTime oneHourFromNowPlus10Min = now.plusMinutes(70);
            
            // 면접 예정 상태인 모든 후보자 조회
            List<JobCandProgress> upcomingInterviews = jobCandProgressRepository
                .findByJobCandCurrStage("3n");
            
            for (JobCandProgress progress : upcomingInterviews) {
                if (progress.getAiIntrvwScheduleId() != null) {
                    try {
                        // AiInterviewSchedule 정보 조회
                        AiInterviewSchedule schedule = aiInterviewScheduleRepository
                            .findById(progress.getAiIntrvwScheduleId())
                            .orElse(null);
                        
                        if (schedule != null && progress.getPost() != null && progress.getCandidate() != null) {
                            LocalDateTime interviewTime = schedule.getAiInterviewScheduledTime();
                            
                            // 하루 전 알림 체크 (24시간 전 ± 1시간 범위)
                            if (interviewTime.isAfter(oneDayFromNow) && interviewTime.isBefore(oneDayFromNowPlus1Hour)) {
                                // 이미 하루 전 알림을 보냈는지 확인
                                boolean alreadyNotified = candidateNotificationRepository
                                    .existsByCandidateIdAndNotificationTypeAndCreatedAtAfter(
                                        progress.getCandidate().getCandidateId(),
                                        "INTERVIEW_DAY_BEFORE",
                                        now.minusHours(2)
                                    );
                                
                                if (!alreadyNotified) {
                                    createInterviewDayBeforeNotification(
                                        progress.getCandidate().getCandidateId(),
                                        progress.getPost().getPostId(),
                                        progress.getPost().getCompanyAdminId(),
                                        progress.getAiIntrvwScheduleId()
                                    );
                                    log.info("하루 전 면접 알림 생성: candidateId={}, postId={}", 
                                        progress.getCandidate().getCandidateId(), progress.getPost().getPostId());
                                }
                            }
                            
                            // 한 시간 전 알림 체크 (1시간 전 ± 10분 범위)
                            if (interviewTime.isAfter(oneHourFromNow) && interviewTime.isBefore(oneHourFromNowPlus10Min)) {
                                // 이미 한 시간 전 알림을 보냈는지 확인
                                boolean alreadyNotified = candidateNotificationRepository
                                    .existsByCandidateIdAndNotificationTypeAndCreatedAtAfter(
                                        progress.getCandidate().getCandidateId(),
                                        "INTERVIEW_ONE_HOUR_BEFORE",
                                        now.minusMinutes(30)
                                    );
                                
                                if (!alreadyNotified) {
                                    createInterviewOneHourBeforeNotification(
                                        progress.getCandidate().getCandidateId(),
                                        progress.getPost().getPostId(),
                                        progress.getPost().getCompanyAdminId(),
                                        progress.getAiIntrvwScheduleId()
                                    );
                                    log.info("한 시간 전 면접 알림 생성: candidateId={}, postId={}", 
                                        progress.getCandidate().getCandidateId(), progress.getPost().getPostId());
                                }
                            }
                        }
                    } catch (Exception e) {
                        log.error("면접 알림 생성 중 오류 (jobCandidateId={}): {}", 
                            progress.getJobCandidateId(), e.getMessage());
                    }
                }
            }
            
            log.info("면접 임박 알림 체크 완료");
        } catch (Exception e) {
            log.error("면접 임박 알림 체크 중 오류 발생: {}", e.getMessage(), e);
        }
    }

    /**
     * CandidateNotification 엔티티를 DTO로 변환
     */
    private CandidateNotificationDto convertToDto(CandidateNotification notification) {
        String postTitle = null;
        String companyName = null;
        String candidateName = null;
        
        if (notification.getRelatedPostId() != null) {
            postTitle = postRepository.findById(notification.getRelatedPostId())
                    .map(Post::getPostTitle)
                    .orElse(null);
        }
        
        if (notification.getRelatedCompanyId() != null) {
            companyName = companyRepository.findById(notification.getRelatedCompanyId())
                    .map(Company::getCompanyName)
                    .orElse(null);
        }
        
        if (notification.getCandidateId() != null) {
            candidateName = candidateRepository.findById(notification.getCandidateId())
                    .map(Candidate::getCandidateName)
                    .orElse(null);
        }
        
        return CandidateNotificationDto.builder()
                .notificationId(notification.getNotificationId())
                .notificationType(notification.getNotificationType())
                .notificationTitle(notification.getNotificationTitle())
                .notificationMessage(notification.getNotificationMessage())
                .relatedPostId(notification.getRelatedPostId())
                .relatedCompanyId(notification.getRelatedCompanyId())
                .relatedInterviewId(notification.getRelatedInterviewId())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .postTitle(postTitle)
                .companyName(companyName)
                .candidateName(candidateName)
                .build();
    }
} 
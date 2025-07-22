package com.zoop.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.zoop.backend.domain.dto.CandidateNotificationDto;
import com.zoop.backend.service.CandidateNotificationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Tag(name="CandidateNotificationController", description="개인회원 알림 관련 API")
@RestController
@RequestMapping("/api/candidate-notifications")
@RequiredArgsConstructor
public class CandidateNotificationController {

    private final CandidateNotificationService candidateNotificationService;

    @Operation(summary="후보자별 알림 조회", description="후보자의 최근 30일 알림을 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode="200", description="알림 목록 조회 성공",
            content=@Content(schema=@Schema(implementation=CandidateNotificationDto.class))),
        @ApiResponse(responseCode="400", description="잘못된 요청"),
        @ApiResponse(responseCode="403", description="접근 권한 없음"),
        @ApiResponse(responseCode="500", description="서버 오류")
    })
    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<CandidateNotificationDto>> getNotificationsByCandidateId(
            @Parameter(description="후보자 ID", required=true, example="101")
            @PathVariable Long candidateId,
            @RequestParam(required = false) Long requestingCandidateId) {
        try {
            // 보안: 요청한 후보자와 조회하려는 후보자가 같은지 확인
            if (requestingCandidateId != null && !requestingCandidateId.equals(candidateId)) {
                log.warn("권한 없는 알림 조회 시도: requestingCandidateId={}, targetCandidateId={}", 
                    requestingCandidateId, candidateId);
                return ResponseEntity.status(403).build();
            }
            
            List<CandidateNotificationDto> notifications = candidateNotificationService.getNotificationsByCandidateId(candidateId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("후보자 알림 조회 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @Operation(summary="읽지 않은 알림 개수 조회", description="후보자의 읽지 않은 알림 개수를 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode="200", description="읽지 않은 알림 개수 조회 성공",
            content=@Content(schema=@Schema(implementation=Long.class))),
        @ApiResponse(responseCode="400", description="잘못된 요청"),
        @ApiResponse(responseCode="403", description="접근 권한 없음"),
        @ApiResponse(responseCode="500", description="서버 오류")
    })
    @GetMapping("/candidate/{candidateId}/unread-count")
    public ResponseEntity<Long> getUnreadNotificationCount(
            @Parameter(description="후보자 ID", required=true, example="101")
            @PathVariable Long candidateId,
            @RequestParam(required = false) Long requestingCandidateId) {
        try {
            // 보안: 요청한 후보자와 조회하려는 후보자가 같은지 확인
            if (requestingCandidateId != null && !requestingCandidateId.equals(candidateId)) {
                log.warn("권한 없는 알림 개수 조회 시도: requestingCandidateId={}, targetCandidateId={}", 
                    requestingCandidateId, candidateId);
                return ResponseEntity.status(403).build();
            }
            
            long count = candidateNotificationService.getUnreadNotificationCount(candidateId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("읽지 않은 후보자 알림 개수 조회 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @Operation(summary="알림 읽음 처리", description="특정 알림을 읽음 처리합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode="200", description="알림 읽음 처리 성공"),
        @ApiResponse(responseCode="400", description="잘못된 요청"),
        @ApiResponse(responseCode="500", description="서버 오류")
    })
    @PostMapping("/{notificationId}/read")
    public ResponseEntity<String> markNotificationAsRead(
            @Parameter(description="알림 ID", required=true, example="1")
            @PathVariable Long notificationId) {
        try {
            candidateNotificationService.markNotificationAsRead(notificationId);
            return ResponseEntity.ok("알림이 읽음 처리되었습니다.");
        } catch (Exception e) {
            log.error("후보자 알림 읽음 처리 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("알림 읽음 처리 중 오류가 발생했습니다.");
        }
    }

    /**
     * 특정 후보자의 모든 알림을 읽음 처리
     */
    @PostMapping("/candidate/{candidateId}/mark-all-read")
    public ResponseEntity<String> markAllNotificationsAsRead(@PathVariable Long candidateId, 
                                                           @RequestParam Long requestingCandidateId) {
        try {
            // 본인 확인
            if (!candidateId.equals(requestingCandidateId)) {
                return ResponseEntity.status(403).body("본인의 알림만 읽음 처리할 수 있습니다.");
            }
            
            candidateNotificationService.markAllNotificationsAsRead(candidateId);
            return ResponseEntity.ok("모든 알림이 읽음 처리되었습니다.");
        } catch (Exception e) {
            log.error("알림 읽음 처리 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("알림 읽음 처리 중 오류가 발생했습니다.");
        }
    }

    /**
     * 테스트용 면접 알림 생성 (개발/테스트용)
     */
    @PostMapping("/test-interview-notification")
    public ResponseEntity<String> createTestInterviewNotification(@RequestParam Long candidateId,
                                                                 @RequestParam Long postId,
                                                                 @RequestParam Long companyId,
                                                                 @RequestParam Long interviewId) {
        try {
            candidateNotificationService.createTestInterviewNotification(candidateId, postId, companyId, interviewId);
            return ResponseEntity.ok("테스트 면접 알림이 생성되었습니다.");
        } catch (Exception e) {
            log.error("테스트 면접 알림 생성 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("테스트 면접 알림 생성 중 오류가 발생했습니다.");
        }
    }

    @Operation(summary="테스트용 최종 결과 알림 생성", description="개발 및 테스트를 위해 수동으로 최종 결과 알림을 생성합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode="200", description="테스트 알림 생성 성공"),
        @ApiResponse(responseCode="400", description="잘못된 요청"),
        @ApiResponse(responseCode="500", description="서버 오류")
    })
    @PostMapping("/test/final-result/{candidateId}/{postId}/{companyId}")
    public ResponseEntity<String> createTestFinalResultNotification(
            @Parameter(description="후보자 ID", required=true, example="101")
            @PathVariable Long candidateId,
            @Parameter(description="공고 ID", required=true, example="201")
            @PathVariable Long postId,
            @Parameter(description="기업 ID", required=true, example="68")
            @PathVariable Long companyId,
            @Parameter(description="합격 여부", required=true, example="true")
            @RequestParam boolean isAccepted) {
        try {
            candidateNotificationService.createFinalResultNotification(candidateId, postId, companyId, isAccepted);
            return ResponseEntity.ok("테스트 최종 결과 알림이 생성되었습니다.");
        } catch (Exception e) {
            log.error("테스트 최종 결과 알림 생성 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("테스트 알림 생성 중 오류가 발생했습니다.");
        }
    }

    @Operation(summary="테스트용 추가지원자 수락 알림 생성", description="개발 및 테스트를 위해 수동으로 추가지원자 수락 알림을 생성합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode="200", description="테스트 알림 생성 성공"),
        @ApiResponse(responseCode="400", description="잘못된 요청"),
        @ApiResponse(responseCode="500", description="서버 오류")
    })
    @PostMapping("/test/additional-applicant-accepted/{candidateId}/{postId}/{companyId}")
    public ResponseEntity<String> createTestAdditionalApplicantAcceptedNotification(
            @Parameter(description="후보자 ID", required=true, example="101")
            @PathVariable Long candidateId,
            @Parameter(description="공고 ID", required=true, example="201")
            @PathVariable Long postId,
            @Parameter(description="기업 ID", required=true, example="68")
            @PathVariable Long companyId) {
        try {
            candidateNotificationService.createAdditionalApplicantAcceptedNotification(candidateId, postId, companyId);
            return ResponseEntity.ok("테스트 추가지원자 수락 알림이 생성되었습니다.");
        } catch (Exception e) {
            log.error("테스트 추가지원자 수락 알림 생성 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("테스트 알림 생성 중 오류가 발생했습니다.");
        }
    }
} 
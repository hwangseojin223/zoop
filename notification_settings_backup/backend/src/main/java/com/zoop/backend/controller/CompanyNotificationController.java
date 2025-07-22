package com.zoop.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.zoop.backend.domain.dto.CompanyNotificationDto;
import com.zoop.backend.service.CompanyNotificationService;

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
@Tag(name="CompanyNotificationController", description="기업회원 알림 관련 API")
@RestController
@RequestMapping("/api/company-notifications")
@RequiredArgsConstructor
public class CompanyNotificationController {

    private final CompanyNotificationService companyNotificationService;

    @Operation(summary="회사 관리자별 알림 조회", description="회사 관리자의 최근 30일 알림을 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode="200", description="알림 목록 조회 성공",
            content=@Content(schema=@Schema(implementation=CompanyNotificationDto.class))),
        @ApiResponse(responseCode="400", description="잘못된 요청"),
        @ApiResponse(responseCode="403", description="접근 권한 없음"),
        @ApiResponse(responseCode="500", description="서버 오류")
    })
    @GetMapping("/company/{companyAdminId}")
    public ResponseEntity<List<CompanyNotificationDto>> getNotificationsByCompanyAdminId(
            @Parameter(description="회사 관리자 ID", required=true, example="68")
            @PathVariable Long companyAdminId,
            @RequestParam(required = false) Long requestingAdminId) {
        try {
            // 보안: 요청한 관리자와 조회하려는 관리자가 같은지 확인
            if (requestingAdminId != null && !requestingAdminId.equals(companyAdminId)) {
                log.warn("권한 없는 알림 조회 시도: requestingAdminId={}, targetCompanyAdminId={}", 
                    requestingAdminId, companyAdminId);
                return ResponseEntity.status(403).build();
            }
            
            List<CompanyNotificationDto> notifications = companyNotificationService.getNotificationsByCompanyAdminId(companyAdminId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("기업 알림 조회 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @Operation(summary="읽지 않은 알림 개수 조회", description="회사 관리자의 읽지 않은 알림 개수를 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode="200", description="읽지 않은 알림 개수 조회 성공",
            content=@Content(schema=@Schema(implementation=Long.class))),
        @ApiResponse(responseCode="400", description="잘못된 요청"),
        @ApiResponse(responseCode="403", description="접근 권한 없음"),
        @ApiResponse(responseCode="500", description="서버 오류")
    })
    @GetMapping("/company/{companyAdminId}/unread-count")
    public ResponseEntity<Long> getUnreadNotificationCount(
            @Parameter(description="회사 관리자 ID", required=true, example="68")
            @PathVariable Long companyAdminId,
            @RequestParam(required = false) Long requestingAdminId) {
        try {
            // 보안: 요청한 관리자와 조회하려는 관리자가 같은지 확인
            if (requestingAdminId != null && !requestingAdminId.equals(companyAdminId)) {
                log.warn("권한 없는 알림 개수 조회 시도: requestingAdminId={}, targetCompanyAdminId={}", 
                    requestingAdminId, companyAdminId);
                return ResponseEntity.status(403).build();
            }
            
            long count = companyNotificationService.getUnreadNotificationCount(companyAdminId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("읽지 않은 기업 알림 개수 조회 중 오류 발생: {}", e.getMessage(), e);
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
            companyNotificationService.markNotificationAsRead(notificationId);
            return ResponseEntity.ok("알림이 읽음 처리되었습니다.");
        } catch (Exception e) {
            log.error("기업 알림 읽음 처리 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("알림 읽음 처리 중 오류가 발생했습니다.");
        }
    }

    @Operation(summary="모든 알림 읽음 처리", description="회사 관리자의 모든 알림을 읽음 처리합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode="200", description="모든 알림 읽음 처리 성공"),
        @ApiResponse(responseCode="400", description="잘못된 요청"),
        @ApiResponse(responseCode="500", description="서버 오류")
    })
    @PostMapping("/company/{companyAdminId}/read-all")
    public ResponseEntity<String> markAllNotificationsAsRead(
            @Parameter(description="회사 관리자 ID", required=true, example="68")
            @PathVariable Long companyAdminId) {
        try {
            companyNotificationService.markAllNotificationsAsRead(companyAdminId);
            return ResponseEntity.ok("모든 알림이 읽음 처리되었습니다.");
        } catch (Exception e) {
            log.error("모든 기업 알림 읽음 처리 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("모든 알림 읽음 처리 중 오류가 발생했습니다.");
        }
    }

    @Operation(summary="테스트용 면접 분석 완료 알림 생성", description="개발 및 테스트를 위해 수동으로 면접 분석 완료 알림을 생성합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode="200", description="테스트 알림 생성 성공"),
        @ApiResponse(responseCode="400", description="잘못된 요청"),
        @ApiResponse(responseCode="500", description="서버 오류")
    })
    @PostMapping("/test/interview-analysis/{companyAdminId}/{candidateId}/{interviewId}")
    public ResponseEntity<String> createTestInterviewAnalysisNotification(
            @Parameter(description="회사 관리자 ID", required=true, example="68")
            @PathVariable Long companyAdminId,
            @Parameter(description="후보자 ID", required=true, example="101")
            @PathVariable Long candidateId,
            @Parameter(description="면접 ID", required=true, example="301")
            @PathVariable Long interviewId) {
        try {
            companyNotificationService.createInterviewAnalysisCompleteNotification(companyAdminId, candidateId, interviewId);
            return ResponseEntity.ok("테스트 면접 분석 완료 알림이 생성되었습니다.");
        } catch (Exception e) {
            log.error("테스트 면접 분석 알림 생성 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("테스트 알림 생성 중 오류가 발생했습니다.");
        }
    }

    @Operation(summary="테스트용 새로운 지원자 알림 생성", description="개발 및 테스트를 위해 수동으로 새로운 지원자 알림을 생성합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode="200", description="테스트 알림 생성 성공"),
        @ApiResponse(responseCode="400", description="잘못된 요청"),
        @ApiResponse(responseCode="500", description="서버 오류")
    })
    @PostMapping("/test/new-application/{companyAdminId}/{postId}/{candidateId}")
    public ResponseEntity<String> createTestNewApplicationNotification(
            @Parameter(description="회사 관리자 ID", required=true, example="68")
            @PathVariable Long companyAdminId,
            @Parameter(description="공고 ID", required=true, example="201")
            @PathVariable Long postId,
            @Parameter(description="후보자 ID", required=true, example="101")
            @PathVariable Long candidateId) {
        try {
            companyNotificationService.createNewApplicationNotification(companyAdminId, postId, candidateId);
            return ResponseEntity.ok("테스트 새로운 지원자 알림이 생성되었습니다.");
        } catch (Exception e) {
            log.error("테스트 새로운 지원자 알림 생성 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("테스트 알림 생성 중 오류가 발생했습니다.");
        }
    }
} 
package com.zoop.backend.controller;

/**
 *
 * @author hwangseojin
 */
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.zoop.backend.domain.dto.InterviewScheduleRequestDto;
import com.zoop.backend.domain.dto.InterviewScheduleResponseDto;
import com.zoop.backend.service.AiInterviewScheduleService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;


@Tag(name = "AiInterviewScheduleController", description = "AI 면접 일정 관련 API")
@RestController
@RequestMapping("/api/interview-schedules")
public class AiInterviewScheduleController {

    private final AiInterviewScheduleService aiInterviewScheduleService;

    @Autowired
    public AiInterviewScheduleController(AiInterviewScheduleService aiInterviewScheduleService) {
        this.aiInterviewScheduleService = aiInterviewScheduleService;
    }

    @Operation(summary = "AI 면접 일정 등록", description = "후보자가 AI 면접 일정을 등록합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "면접 일정 등록 성공",
                    content = @Content(schema = @Schema(implementation = InterviewScheduleResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (필수 데이터 누락 등)"),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @PostMapping
    public ResponseEntity<InterviewScheduleResponseDto> scheduleInterview(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "면접 일정 등록을 위한 정보",
                    required = true,
                    content = @Content(schema = @Schema(implementation = InterviewScheduleRequestDto.class))
            )
            @RequestBody InterviewScheduleRequestDto requestDto) {
        try {
            InterviewScheduleResponseDto response = aiInterviewScheduleService.scheduleInterview(requestDto);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(InterviewScheduleResponseDto.builder().success(false).message(e.getMessage()).build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(InterviewScheduleResponseDto.builder().success(false).message("면접 일정 등록 중 오류가 발생했습니다: " + e.getMessage()).build());
        }
    }

    @Operation(summary = "후보자별 AI 면접 일정 조회", description = "특정 후보자의 AI 면접 일정을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "면접 일정 목록 조회 성공",
                    content = @Content(schema = @Schema(implementation = InterviewScheduleResponseDto.class))),
            @ApiResponse(responseCode = "404", description = "해당 후보자의 일정을 찾을 수 없음"),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<InterviewScheduleResponseDto>> getInterviewSchedulesByCandidate(
            @Parameter(description = "후보자 ID", required = true)
            @PathVariable Integer candidateId) {
        try {
            List<InterviewScheduleResponseDto> schedules = aiInterviewScheduleService.getInterviewSchedulesByCandidate(candidateId);
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "AI 면접 일정 상세 조회", description = "특정 AI 면접 일정의 상세 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "면접 일정 상세 조회 성공",
                    content = @Content(schema = @Schema(implementation = InterviewScheduleResponseDto.class))),
            @ApiResponse(responseCode = "404", description = "해당 일정을 찾을 수 없음"),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @GetMapping("/{scheduleId}")
    public ResponseEntity<InterviewScheduleResponseDto> getInterviewSchedule(
            @Parameter(description = "면접 일정 ID", required = true)
            @PathVariable Integer scheduleId) {
        try {
            InterviewScheduleResponseDto schedule = aiInterviewScheduleService.getInterviewSchedule(scheduleId);
            return ResponseEntity.ok(schedule);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "AI 면접 일정 상태 업데이트", description = "AI 면접 일정의 상태를 업데이트합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "면접 일정 상태 업데이트 성공",
                    content = @Content(schema = @Schema(implementation = InterviewScheduleResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (상태 값 오류 등)"),
            @ApiResponse(responseCode = "404", description = "해당 일정을 찾을 수 없음"),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @PutMapping("/{scheduleId}/status")
    public ResponseEntity<InterviewScheduleResponseDto> updateInterviewStatus(
            @Parameter(description = "면접 일정 ID", required = true)
            @PathVariable Integer scheduleId,
            @Parameter(description = "업데이트할 상태 (예: 'completed', 'cancelled')", required = true)
            @RequestParam String status) {
        try {
            InterviewScheduleResponseDto response = aiInterviewScheduleService.updateInterviewStatus(scheduleId, status);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(InterviewScheduleResponseDto.builder().success(false).message(e.getMessage()).build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(InterviewScheduleResponseDto.builder().success(false).message("면접 상태 업데이트 중 오류가 발생했습니다: " + e.getMessage()).build());
        }
    }

    @Operation(summary = "AI 면접 완료", description = "AI 면접을 완료하고 상태를 업데이트합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "면접 완료 성공",
                    content = @Content(schema = @Schema(implementation = InterviewScheduleResponseDto.class))),
            @ApiResponse(responseCode = "404", description = "해당 일정을 찾을 수 없음"),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @PutMapping("/{scheduleId}/complete")
    public ResponseEntity<InterviewScheduleResponseDto> completeInterview(
            @Parameter(description = "면접 일정 ID", required = true)
            @PathVariable Integer scheduleId) {
        try {
            InterviewScheduleResponseDto response = aiInterviewScheduleService.completeInterview(scheduleId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(InterviewScheduleResponseDto.builder().success(false).message(e.getMessage()).build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(InterviewScheduleResponseDto.builder().success(false).message("면접 완료 처리 중 오류가 발생했습니다: " + e.getMessage()).build());
        }
    }

    // @Operation(summary = "AI 면접 영상 업로드", description = "면접 녹화 영상을 S3에 업로드하고 DB에 URL을 저장합니다.")
    // @ApiResponses(value = {
    //     @ApiResponse(responseCode = "200", description = "업로드 성공 및 URL 반환"),
    //     @ApiResponse(responseCode = "400", description = "잘못된 요청"),
    //     @ApiResponse(responseCode = "500", description = "서버 오류")
    // })
    // @PostMapping("/upload-video")
    // public ResponseEntity<?> uploadInterviewVideo(
    //     @RequestParam Integer scheduleId,
    //     @RequestParam("videoFile") MultipartFile videoFile) {
    //     try {
    //         String videoUrl = aiInterviewScheduleService.uploadInterviewVideo(scheduleId, videoFile);
    //         return ResponseEntity.ok().body(videoUrl);
    //     } catch (RuntimeException e) {
    //         return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    //     } catch (Exception e) {
    //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("업로드 중 오류: " + e.getMessage());
    //     }
    // }
    // TODO: Use the new ai_interview_videos upload endpoint instead.
}

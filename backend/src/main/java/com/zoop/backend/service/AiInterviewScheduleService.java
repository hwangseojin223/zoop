/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.zoop.backend.service;

/**
 *
 * @author hwangseojin
 */
import java.time.LocalDateTime;
import java.time.ZoneId; // 추가
import java.time.ZonedDateTime; // 추가
import java.time.format.DateTimeFormatter; // 추가
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zoop.backend.domain.dto.InterviewScheduleRequestDto;
import com.zoop.backend.domain.dto.InterviewScheduleResponseDto;
import com.zoop.backend.domain.entity.AiInterviewSchedule;
import com.zoop.backend.domain.entity.JobCandProgress;
import com.zoop.backend.repository.AiInterviewScheduleRepository;
import com.zoop.backend.repository.JobCandProgressRepository;

@Service
public class AiInterviewScheduleService {
    private final AiInterviewScheduleRepository aiInterviewScheduleRepository;
    private final JobCandProgressRepository jobCandProgressRepository;

    @Autowired
    public AiInterviewScheduleService(AiInterviewScheduleRepository aiInterviewScheduleRepository,
                                    JobCandProgressRepository jobCandProgressRepository) {
        this.aiInterviewScheduleRepository = aiInterviewScheduleRepository;
        this.jobCandProgressRepository = jobCandProgressRepository;
    }
    
    @Transactional
    public InterviewScheduleResponseDto scheduleInterview(InterviewScheduleRequestDto requestDto) {
        // 1. postId와 candidateId로 JobCandProgress 레코드 찾기
        JobCandProgress jobCandProgress = jobCandProgressRepository
            .findByPost_PostIdAndCandidate_CandidateId(requestDto.getPostId(), requestDto.getCandidateId())
            .orElseThrow(() -> new RuntimeException("해당 공고에 대한 후보자 진행 상태를 찾을 수 없습니다."));
        
        // 2. 면접 일정 생성
        LocalDateTime receivedDateTime = LocalDateTime.parse(requestDto.getScheduledTime(), DateTimeFormatter.ISO_DATE_TIME);
        
        // 한국 시간대(KST)로 ZonedDateTime 생성
        ZonedDateTime koreaTime = receivedDateTime.atZone(ZoneId.of("Asia/Seoul"));
        
        // UTC 시간대로 변환
        ZonedDateTime utcTime = koreaTime.withZoneSameInstant(ZoneId.of("UTC"));
        
        // 데이터베이스에 저장할 LocalDateTime (UTC 기준)
        LocalDateTime timeToSave = utcTime.toLocalDateTime();
        LocalDateTime deadlineTime = timeToSave.plusHours(24); // 면접 마감 시간은 예약 시간 + 24시간으로 설정
        
        // 3. 면접 링크 생성 (실제로는 더 복잡한 로직이 필요할 수 있음)
        String interviewLink = "https://zoop.ai/interview/" + UUID.randomUUID().toString();
        
        // 4. AiInterviewSchedule 엔티티 생성 및 저장
AiInterviewSchedule schedule = AiInterviewSchedule.builder()
        .jobCandidateId(jobCandProgress.getJobCandidateId().intValue()) // Long을 Integer로 변환
        .aiInterviewScheduledTime(timeToSave)
        .aiInterviewDeadlineTime(deadlineTime)
        .aiInterviewLink(interviewLink)
        .aiInterviewStatus("scheduled") // 초기 상태는 'scheduled'
        .build();
        
        AiInterviewSchedule savedSchedule = aiInterviewScheduleRepository.save(schedule);
        
        // 5. JobCandProgress 상태 업데이트 (3n -> 4n)
        jobCandProgress.setJobCandCurrStage("4n");
        jobCandProgress.setAiIntrvwScheduleId(savedSchedule.getAiInterviewScheduleId().longValue());
        jobCandProgressRepository.save(jobCandProgress);
        
        // 6. 응답 DTO 생성 및 반환
        return InterviewScheduleResponseDto.builder()
                .scheduleId(savedSchedule.getAiInterviewScheduleId())
                .jobCandidateId(jobCandProgress.getJobCandidateId().intValue())
                .scheduledTime(koreaTime.toLocalDateTime()) // 응답은 한국 시간으로
                .deadlineTime(deadlineTime.atZone(ZoneId.of("UTC")).withZoneSameInstant(ZoneId.of("Asia/Seoul")).toLocalDateTime()) // 마감 시간도 한국 시간으로
                .interviewLink(interviewLink)
                .status("scheduled")
                .message("면접 일정이 성공적으로 등록되었습니다.")
                .success(true)
                .build();

    }

    
    @Transactional(readOnly = true)
    public List<InterviewScheduleResponseDto> getInterviewSchedulesByCandidate(Integer candidateId) {
        List<AiInterviewSchedule> schedules = aiInterviewScheduleRepository.findByJobCandidateId(candidateId);
        
        return schedules.stream()
                .map(schedule -> {
                    // 저장된 UTC 시간을 한국 시간으로 변환
                    LocalDateTime utcScheduledTime = schedule.getAiInterviewScheduledTime();
                    ZonedDateTime utcZonedScheduledTime = utcScheduledTime.atZone(ZoneId.of("UTC"));
                    LocalDateTime koreaScheduledTime = utcZonedScheduledTime.withZoneSameInstant(ZoneId.of("Asia/Seoul")).toLocalDateTime();

                    LocalDateTime utcDeadlineTime = schedule.getAiInterviewDeadlineTime();
                    ZonedDateTime utcZonedDeadlineTime = utcDeadlineTime.atZone(ZoneId.of("UTC"));
                    LocalDateTime koreaDeadlineTime = utcZonedDeadlineTime.withZoneSameInstant(ZoneId.of("Asia/Seoul")).toLocalDateTime();
                    return InterviewScheduleResponseDto.builder()
                            .scheduleId(schedule.getAiInterviewScheduleId())
                            .jobCandidateId(schedule.getJobCandidateId())
                            .scheduledTime(koreaScheduledTime) // 한국 시간으로 반환
                            .deadlineTime(koreaDeadlineTime) // 한국 시간으로 반환
                            .interviewLink(schedule.getAiInterviewLink())
                            .status(schedule.getAiInterviewStatus())
                            .build();
                })
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public InterviewScheduleResponseDto getInterviewSchedule(Integer scheduleId) {
        AiInterviewSchedule schedule = aiInterviewScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("해당 면접 일정을 찾을 수 없습니다."));
        
        // 저장된 UTC 시간을 한국 시간으로 변환
        LocalDateTime utcScheduledTime = schedule.getAiInterviewScheduledTime();
        ZonedDateTime utcZonedScheduledTime = utcScheduledTime.atZone(ZoneId.of("UTC"));
        LocalDateTime koreaScheduledTime = utcZonedScheduledTime.withZoneSameInstant(ZoneId.of("Asia/Seoul")).toLocalDateTime();

        LocalDateTime utcDeadlineTime = schedule.getAiInterviewDeadlineTime();
        ZonedDateTime utcZonedDeadlineTime = utcDeadlineTime.atZone(ZoneId.of("UTC"));
        LocalDateTime koreaDeadlineTime = utcZonedDeadlineTime.withZoneSameInstant(ZoneId.of("Asia/Seoul")).toLocalDateTime();

        return InterviewScheduleResponseDto.builder()
                .scheduleId(schedule.getAiInterviewScheduleId())
                .jobCandidateId(schedule.getJobCandidateId())
                .scheduledTime(koreaScheduledTime) // 한국 시간으로 반환
                .deadlineTime(koreaDeadlineTime) // 한국 시간으로 반환
                .interviewLink(schedule.getAiInterviewLink())
                .status(schedule.getAiInterviewStatus())
                .build();
    }
    
    @Transactional
    public InterviewScheduleResponseDto updateInterviewStatus(Integer scheduleId, String status) {
        AiInterviewSchedule schedule = aiInterviewScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("해당 면접 일정을 찾을 수 없습니다."));
        
        schedule.setAiInterviewStatus(status);
        
        if ("completed".equals(status)) {
            schedule.setAiInterviewCompletionTime(LocalDateTime.now());
        }
        
        AiInterviewSchedule updatedSchedule = aiInterviewScheduleRepository.save(schedule);
        
        // 응답 시에도 한국 시간으로 변환하여 반환
        LocalDateTime utcScheduledTime = updatedSchedule.getAiInterviewScheduledTime();
        ZonedDateTime utcZonedScheduledTime = utcScheduledTime.atZone(ZoneId.of("UTC"));
        LocalDateTime koreaScheduledTime = utcZonedScheduledTime.withZoneSameInstant(ZoneId.of("Asia/Seoul")).toLocalDateTime();

        LocalDateTime utcDeadlineTime = updatedSchedule.getAiInterviewDeadlineTime();
        ZonedDateTime utcZonedDeadlineTime = utcDeadlineTime.atZone(ZoneId.of("UTC"));
        LocalDateTime koreaDeadlineTime = utcZonedDeadlineTime.withZoneSameInstant(ZoneId.of("Asia/Seoul")).toLocalDateTime();

        return InterviewScheduleResponseDto.builder()
                .scheduleId(updatedSchedule.getAiInterviewScheduleId())
                .jobCandidateId(updatedSchedule.getJobCandidateId())
                .scheduledTime(koreaScheduledTime) // 한국 시간으로 반환
                .deadlineTime(koreaDeadlineTime) // 한국 시간으로 반환
                .interviewLink(updatedSchedule.getAiInterviewLink())
                .status(updatedSchedule.getAiInterviewStatus())
                .message("면접 상태가 성공적으로 업데이트되었습니다.")
                .success(true)
                .build();
    }
}

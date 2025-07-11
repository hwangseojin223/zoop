package com.zoop.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.zoop.backend.domain.entity.AiInterviewSchedule;
import com.zoop.backend.domain.entity.AiInterviewVideo;
import com.zoop.backend.repository.AiInterviewScheduleRepository;
import com.zoop.backend.repository.AiInterviewVideoRepository;

@Service
public class AiInterviewVideoService {
    private final AiInterviewVideoRepository aiInterviewVideoRepository;
    private final AiInterviewScheduleRepository aiInterviewScheduleRepository;
    private final S3Service s3Service;
    private final AiInterviewScheduleService aiInterviewScheduleService;

    @Autowired
    public AiInterviewVideoService(AiInterviewVideoRepository aiInterviewVideoRepository,
                                   AiInterviewScheduleRepository aiInterviewScheduleRepository,
                                   S3Service s3Service,
                                   AiInterviewScheduleService aiInterviewScheduleService) {
        this.aiInterviewVideoRepository = aiInterviewVideoRepository;
        this.aiInterviewScheduleRepository = aiInterviewScheduleRepository;
        this.s3Service = s3Service;
        this.aiInterviewScheduleService = aiInterviewScheduleService;
    }

    @Transactional
    public AiInterviewVideo uploadInterviewVideo(Integer scheduleId, Integer questionNumber, String questionContent, MultipartFile videoFile) throws Exception {
        AiInterviewSchedule schedule = aiInterviewScheduleRepository.findById(scheduleId.longValue())
                .orElseThrow(() -> new RuntimeException("해당 면접 일정을 찾을 수 없습니다."));
        // S3 업로드
        String videoUrl = s3Service.uploadInterviewVideoFile(videoFile);
        // DB 저장
        AiInterviewVideo video = AiInterviewVideo.builder()
                .aiInterviewSchedule(schedule)
                .questionNumber(questionNumber)
                .questionContent(questionContent)
                .videoFilePath(videoUrl)
                .videoCreatedAt(LocalDateTime.now())
                .build();
        AiInterviewVideo saved = aiInterviewVideoRepository.save(video);
        // 마지막 질문(3번) 업로드 시 면접 완료 처리
        if (questionNumber == 3) {
            aiInterviewScheduleService.completeInterview(scheduleId.longValue());
        }
        return saved;
    }

    public List<AiInterviewVideo> findByScheduleId(Integer scheduleId) {
        return aiInterviewVideoRepository.findByAiInterviewSchedule_AiInterviewScheduleId(scheduleId);
    }

    public AiInterviewVideo findById(Long videoId) {
        return aiInterviewVideoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("해당 영상을 찾을 수 없습니다."));
    }

    public List<AiInterviewVideo> getVideosByJobCandidateId(Long jobCandidateId) {
        return aiInterviewVideoRepository.findByAiInterviewSchedule_JobCandProgress_JobCandidateId(jobCandidateId);
    }
} 
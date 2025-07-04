package com.zoop.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.zoop.backend.domain.entity.AiInterviewVideo;
import com.zoop.backend.service.AiInterviewVideoService;

@RestController
@RequestMapping("/api/interview-videos")
public class AiInterviewVideoController {
    private final AiInterviewVideoService aiInterviewVideoService;

    @Autowired
    public AiInterviewVideoController(AiInterviewVideoService aiInterviewVideoService) {
        this.aiInterviewVideoService = aiInterviewVideoService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadInterviewVideo(
            @RequestParam Integer scheduleId,
            @RequestParam Integer questionNumber,
            @RequestParam(required = false) String questionContent,
            @RequestParam("videoFile") MultipartFile videoFile) {
        try {
            AiInterviewVideo video = aiInterviewVideoService.uploadInterviewVideo(scheduleId, questionNumber, questionContent, videoFile);
            return ResponseEntity.ok(video);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("업로드 중 오류: " + e.getMessage());
        }
    }
} 
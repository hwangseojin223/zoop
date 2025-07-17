package com.zoop.backend.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.transaction.annotation.Transactional;

import com.zoop.backend.domain.entity.CandidateResume;
import com.zoop.backend.domain.entity.ResumeEducation;
import com.zoop.backend.domain.entity.ResumeExperience;
import com.zoop.backend.repository.CandidateResumeRepository;
import com.zoop.backend.repository.ResumeEducationRepository;
import com.zoop.backend.repository.ResumeExperienceRepository;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {
    private final CandidateResumeRepository resumeRepo;
    private final ResumeEducationRepository eduRepo;
    private final ResumeExperienceRepository expRepo;

    @PostMapping
    @Transactional
    public ResponseEntity<?> createOrUpdateResume(@RequestBody ResumeCreateRequest req) {
        // 1. candidate_id로 기존 이력서 조회
        List<CandidateResume> existingResumes = resumeRepo.findByCandidateIdOrderByCreatedAtDesc(req.getCandidateId());
        CandidateResume resume;
        if (!existingResumes.isEmpty()) {
            // 기존 이력서가 있으면 update
            resume = existingResumes.get(0);
            resume.setSelfIntro(req.getSelfIntro());
            resume.setIsPublic(req.getIsPublic());
            resume.setStatus(req.getStatus());
            resume.setUpdatedAt(new java.sql.Timestamp(System.currentTimeMillis()));
        } else {
            // 없으면 새로 생성
            resume = new CandidateResume();
            resume.setCandidateId(req.getCandidateId());
            resume.setSelfIntro(req.getSelfIntro());
            resume.setIsPublic(req.getIsPublic());
            resume.setStatus(req.getStatus());
            resume.setCreatedAt(new java.sql.Timestamp(System.currentTimeMillis()));
            resume.setUpdatedAt(new java.sql.Timestamp(System.currentTimeMillis()));
        }
        CandidateResume saved = resumeRepo.save(resume);

        // 학력/경력은 기존 데이터 삭제 후 새로 저장(덮어쓰기)
        eduRepo.deleteByResume_ResumeId(saved.getResumeId());
        expRepo.deleteByResume_ResumeId(saved.getResumeId());
        if (req.getEducations() != null) {
            for (ResumeEducation edu : req.getEducations()) {
                edu.setResume(saved);
                edu.setCreatedAt(new java.sql.Timestamp(System.currentTimeMillis()));
                edu.setUpdatedAt(new java.sql.Timestamp(System.currentTimeMillis()));
                eduRepo.save(edu);
            }
        }
        if (req.getExperiences() != null) {
            for (ResumeExperience exp : req.getExperiences()) {
                exp.setResume(saved);
                exp.setCreatedAt(new java.sql.Timestamp(System.currentTimeMillis()));
                exp.setUpdatedAt(new java.sql.Timestamp(System.currentTimeMillis()));
                expRepo.save(exp);
            }
        }
        return ResponseEntity.ok(saved.getResumeId());
    }

    @GetMapping("/{resumeId}")
    public ResponseEntity<?> getResume(@PathVariable Long resumeId) {
        CandidateResume resume = resumeRepo.findById(resumeId).orElseThrow();
        List<ResumeEducation> educations = eduRepo.findByResume_ResumeId(resumeId);
        List<ResumeExperience> experiences = expRepo.findByResume_ResumeId(resumeId);
        return ResponseEntity.ok(new ResumeDetailResponse(resume, educations, experiences));
    }

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<?> getResumesByCandidate(@PathVariable Long candidateId) {
        List<CandidateResume> resumes = resumeRepo.findByCandidateIdOrderByCreatedAtDesc(candidateId);
        List<ResumeDetailResponse> resumeDetails = new ArrayList<>();
        
        for (CandidateResume resume : resumes) {
            List<ResumeEducation> educations = eduRepo.findByResume_ResumeId(resume.getResumeId());
            List<ResumeExperience> experiences = expRepo.findByResume_ResumeId(resume.getResumeId());
            resumeDetails.add(new ResumeDetailResponse(resume, educations, experiences));
        }
        
        return ResponseEntity.ok(resumeDetails);
    }

    @GetMapping("/public")
    public ResponseEntity<?> getPublicResumes() {
        List<CandidateResume> resumes = resumeRepo.findByIsPublicOrderByCreatedAtDesc("Y");
        List<ResumeDetailResponse> resumeDetails = new ArrayList<>();
        for (CandidateResume resume : resumes) {
            List<ResumeEducation> educations = eduRepo.findByResume_ResumeId(resume.getResumeId());
            List<ResumeExperience> experiences = expRepo.findByResume_ResumeId(resume.getResumeId());
            resumeDetails.add(new ResumeDetailResponse(resume, educations, experiences));
        }
        return ResponseEntity.ok(resumeDetails);
    }

    // DTO 정의 (Lombok 사용)
    @Data
    public static class ResumeCreateRequest {
        private Long candidateId;
        private String selfIntro;
        private String isPublic;
        private String status;
        private List<ResumeEducation> educations;
        private List<ResumeExperience> experiences;
    }
    
    @Data
    @AllArgsConstructor
    public static class ResumeDetailResponse {
        private CandidateResume resume;
        private List<ResumeEducation> educations;
        private List<ResumeExperience> experiences;
    }
} 
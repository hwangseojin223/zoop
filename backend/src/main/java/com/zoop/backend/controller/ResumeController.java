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
    public ResponseEntity<?> createResume(@RequestBody ResumeCreateRequest req) {
        System.out.println("=== [DEBUG] ResumeController.createResume() 진입 ===");
        System.out.println("[ResumeController] candidateId: " + req.getCandidateId());
        System.out.println("[ResumeController] selfIntro: " + req.getSelfIntro());
        System.out.println("[ResumeController] isPublic: " + req.getIsPublic());
        System.out.println("[ResumeController] status: " + req.getStatus());
        System.out.println("[ResumeController] educations size: " + (req.getEducations() != null ? req.getEducations().size() : "null"));
        System.out.println("[ResumeController] experiences size: " + (req.getExperiences() != null ? req.getExperiences().size() : "null"));
        
        if (req.getEducations() != null) {
            for (int i = 0; i < req.getEducations().size(); i++) {
                ResumeEducation edu = req.getEducations().get(i);
                System.out.println("[ResumeController] education[" + i + "]: " + edu.toString());
            }
        }
        
        if (req.getExperiences() != null) {
            for (int i = 0; i < req.getExperiences().size(); i++) {
                ResumeExperience exp = req.getExperiences().get(i);
                System.out.println("[ResumeController] experience[" + i + "]: " + exp.toString());
            }
        }
        
        CandidateResume resume = new CandidateResume();
        resume.setCandidateId(req.getCandidateId());
        resume.setSelfIntro(req.getSelfIntro());
        resume.setIsPublic(req.getIsPublic());
        resume.setStatus(req.getStatus());
        resume.setCreatedAt(new java.sql.Timestamp(System.currentTimeMillis()));
        resume.setUpdatedAt(new java.sql.Timestamp(System.currentTimeMillis()));
        CandidateResume saved = resumeRepo.save(resume);
        System.out.println("[ResumeController] 저장된 resume ID: " + saved.getResumeId());
        
        // 학력 저장
        if (req.getEducations() != null) {
            for (ResumeEducation edu : req.getEducations()) {
                edu.setResume(saved);
                edu.setCreatedAt(new java.sql.Timestamp(System.currentTimeMillis()));
                edu.setUpdatedAt(new java.sql.Timestamp(System.currentTimeMillis()));
                ResumeEducation savedEdu = eduRepo.save(edu);
                System.out.println("[ResumeController] 저장된 education ID: " + savedEdu.getEducationId());
            }
        }
        
        // 경력 저장
        if (req.getExperiences() != null) {
            for (ResumeExperience exp : req.getExperiences()) {
                exp.setResume(saved);
                exp.setCreatedAt(new java.sql.Timestamp(System.currentTimeMillis()));
                exp.setUpdatedAt(new java.sql.Timestamp(System.currentTimeMillis()));
                ResumeExperience savedExp = expRepo.save(exp);
                System.out.println("[ResumeController] 저장된 experience ID: " + savedExp.getExperienceId());
            }
        }
        
        System.out.println("[ResumeController] 이력서 저장 완료");
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
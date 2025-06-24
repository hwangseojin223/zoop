package com.zoop.backend.service;

import java.time.LocalDateTime;
import java.util.List; // ObjectMapper 임포트 추가
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service; // JobCandProgress 엔티티 임포트
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile; // JobCandProgressRepository 임포트

import com.zoop.backend.domain.dto.CareerDataDto;
import com.zoop.backend.domain.dto.PortfolioSubmissionResponseDto;
import com.zoop.backend.domain.entity.JobCandProgress;
import com.zoop.backend.domain.entity.Portfolio;
import com.zoop.backend.repository.JobCandProgressRepository;
import com.zoop.backend.repository.PortfolioRepository;

@Service
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final FileStorageService fileStorageService;
    private final JobCandProgressRepository jobCandProgressRepository; // JobCandProgressRepository 주입

    @Autowired
    public PortfolioService(PortfolioRepository portfolioRepository, FileStorageService fileStorageService,
                            JobCandProgressRepository jobCandProgressRepository) { // 생성자 주입
        this.portfolioRepository = portfolioRepository;
        this.fileStorageService = fileStorageService;
        this.jobCandProgressRepository = jobCandProgressRepository;
    }
    
    @Transactional
    public PortfolioSubmissionResponseDto submitPortfolio(
            Integer postId,
            Integer candidateId, // 이 candidateId는 사용자의 ID입니다 (예: 13)
            MultipartFile portfolioFile,
            MultipartFile resumeFile,
            String portfolioContent,
            String portfolioUrl,
            CareerDataDto careerData,
            String goalStatement,
            String suitabilityStatement,
            boolean agreeRequiredPersonal,
            boolean agreeOptionalPersonal,
            boolean agreeFutureProposals,
            boolean agreeReceiveRecruitmentInfo
    ) {
        // 필수 동의 체크
        if (!agreeRequiredPersonal) {
            throw new IllegalArgumentException("필수 개인정보 수집 및 이용에 동의해야 합니다.");
        }
        
        // 파일 저장 (기존 로직 유지)
        String portfolioFilePath = null;
        if (portfolioFile != null && !portfolioFile.isEmpty()) {
            portfolioFilePath = fileStorageService.storeFile(portfolioFile);
        }
        
        String resumeFilePath = null;
        if (resumeFile != null && !resumeFile.isEmpty()) {
            resumeFilePath = fileStorageService.storeFile(resumeFile);
        }
        
        // --- 핵심 변경 부분 ---
        // 1. postId와 사용자 candidateId를 사용하여 JobCandProgress 레코드를 찾습니다.
        JobCandProgress jobCandProgress = jobCandProgressRepository
            .findByPost_PostIdAndCandidate_CandidateId(postId, candidateId) // 또는 findByPostIdAndCandidateId
            .orElseThrow(() -> new RuntimeException("해당 공고에 대한 후보자 진행 상태를 찾을 수 없습니다."));

        // 2. 찾은 JobCandProgress 레코드의 기본 키(job_candidate_id)를 가져옵니다.
        //    이것이 portfolios 테이블의 job_candidate_id에 들어가야 할 실제 값입니다.
        // JobCandProgress에서 가져온 ID 값을 Integer로 변환
        Integer jobCandProgressPk = jobCandProgress.getJobCandidateId().intValue();

// 포트폴리오 정보 저장
        Portfolio portfolio = Portfolio.builder()
                .jobCandidateId(jobCandProgressPk) // Integer 타입으로 변환된 값 사용
                .portfolioFilePath(portfolioFilePath)
                .portfolioContent(portfolioContent)
                .portfolioUrl(portfolioUrl)
                .build();
        
        Portfolio savedPortfolio = portfolioRepository.save(portfolio);

        jobCandProgress.setJobCandCurrStage("3n"); // 현재 진행 단계를 '3n'으로 변경
        jobCandProgress.setJobCandPortfolioSubDate(LocalDateTime.now()); // 포트폴리오 제출 시각 기록
        jobCandProgressRepository.save(jobCandProgress); // 업데이트된 JobCandProgress 저장
        
        PortfolioSubmissionResponseDto response = new PortfolioSubmissionResponseDto();
        response.setPortfolioId(savedPortfolio.getPortfolioId());
        response.setMessage("포트폴리오가 성공적으로 제출되었습니다.");
        response.setSuccess(true);
        
        return response;
    }
    
    public List<Portfolio> getPortfoliosByCandidate(Integer candidateId) {
        return portfolioRepository.findByJobCandidateId(candidateId);
    }
    
    public Optional<Portfolio> getPortfolio(Integer portfolioId) {
        return portfolioRepository.findById(portfolioId);
    }
}

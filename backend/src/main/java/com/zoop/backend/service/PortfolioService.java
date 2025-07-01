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
    private final S3Service s3Service;
    private final JobCandProgressRepository jobCandProgressRepository; // JobCandProgressRepository 주입

    @Autowired
    public PortfolioService(PortfolioRepository portfolioRepository, S3Service s3Service,
                            JobCandProgressRepository jobCandProgressRepository) { // 생성자 주입
        this.portfolioRepository = portfolioRepository;
        this.s3Service = s3Service;
        this.jobCandProgressRepository = jobCandProgressRepository;
    }
    
    @Transactional
    public PortfolioSubmissionResponseDto submitPortfolio(
            Integer postId,
            Integer candidateId, // 이 candidateId는 사용자의 ID입니다 (예: 13)
            MultipartFile portfolioFile,
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
        System.out.println("==== PortfolioService.submitPortfolio() 호출됨 ====");
        System.out.println("[PortfolioService] portfolioFile: " + (portfolioFile != null ? portfolioFile.getOriginalFilename() : "null"));
        
        // 필수 동의 체크
        if (!agreeRequiredPersonal) {
            throw new IllegalArgumentException("필수 개인정보 수집 및 이용에 동의해야 합니다.");
        }
        
        // 포트폴리오 파일 필수 체크
        if (portfolioFile == null || portfolioFile.isEmpty()) {
            throw new IllegalArgumentException("포트폴리오 파일은 필수입니다.");
        }
        
        String portfolioFilePath = null;
        try {
            System.out.println("[PortfolioService] S3 업로드 시작 전 - portfolioFile: " + portfolioFile.getOriginalFilename());
            portfolioFilePath = s3Service.uploadPortfolioFile(portfolioFile);
            System.out.println("[PortfolioService] S3 업로드 완료 후 - portfolioFilePath: " + portfolioFilePath);
        } catch (Exception e) {
            System.err.println("[PortfolioService] S3 업로드 중 예외 발생: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("포트폴리오 파일 업로드 실패: " + e.getMessage(), e);
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

        System.out.println("[PortfolioService] portfolioFilePath(S3 URL): " + portfolioFilePath);
        System.out.println("[PortfolioService] Portfolio 엔티티 생성 시작");
        Portfolio portfolio = Portfolio.builder()
                .jobCandidateId(jobCandProgressPk) // Integer 타입으로 변환된 값 사용
                .portfolioFilePath(portfolioFilePath)
                .portfolioContent(portfolioContent)
                .portfolioUrl(portfolioUrl)
                .build();
        System.out.println("[PortfolioService] Portfolio 엔티티 생성 완료 - portfolioFilePath: " + portfolio.getPortfolioFilePath());
        
        System.out.println("[PortfolioService] DB 저장 시작");
        Portfolio savedPortfolio = portfolioRepository.save(portfolio);
        System.out.println("[PortfolioService] DB 저장 완료 - 저장된 Portfolio의 portfolioFilePath: " + savedPortfolio.getPortfolioFilePath());
        System.out.println("[PortfolioService] 저장된 Portfolio 전체 정보: " + savedPortfolio.toString());

        jobCandProgress.setJobCandCurrStage("2y"); // 포트폴리오 제출 완료 상태로 변경
        jobCandProgress.setJobCandPortfolioSubDate(LocalDateTime.now()); // 포트폴리오 제출 시각 기록
        jobCandProgressRepository.save(jobCandProgress); // 업데이트된 JobCandProgress 저장
        
        PortfolioSubmissionResponseDto response = new PortfolioSubmissionResponseDto();
        response.setPortfolioId(savedPortfolio.getPortfolioId());
        response.setMessage("포트폴리오가 성공적으로 제출되었습니다.");
        response.setSuccess(true);
        System.out.println("[PortfolioService] 응답 DTO 설정 전 - savedPortfolio.getPortfolioFilePath(): " + savedPortfolio.getPortfolioFilePath());
        response.setPortfolioFilePath(savedPortfolio.getPortfolioFilePath()); // S3 URL 응답에 포함
        System.out.println("[PortfolioService] 응답 DTO 설정 후 - response.getPortfolioFilePath(): " + response.getPortfolioFilePath());
        System.out.println("[PortfolioService] 최종 응답: " + response.toString());
        
        return response;
    }
    
    public List<Portfolio> getPortfoliosByCandidate(Integer candidateId) {
        return portfolioRepository.findByJobCandidateId(candidateId);
    }
    
    public Optional<Portfolio> getPortfolio(Integer portfolioId) {
        return portfolioRepository.findById(portfolioId);
    }
}

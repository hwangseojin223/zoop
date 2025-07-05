package com.zoop.backend.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import com.zoop.backend.domain.dto.CandidatePreferencesDto;
import com.zoop.backend.domain.entity.Candidate;
import com.zoop.backend.repository.CandidateRepository;
import com.zoop.backend.repository.InvitationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CandidateService {

    private static final Logger logger = LoggerFactory.getLogger(CandidateService.class);

    // 비밀번호 암호화객체
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    @Autowired
    private final CandidateRepository candidateRepository;
    private final InvitationRepository invitationRepository;
    
    @PersistenceContext
    private EntityManager entityManager;

    public List<Candidate> findAll() {
        return candidateRepository.findAll();
    }

    @Transactional 
    public Candidate save(Candidate candidate) {
        try {
            // 비밀번호 암호화
            String encrypted = passwordEncoder.encode(candidate.getCandidatePassword());
            
            // 비밀번호 암호화 전/후 로그 출력
            logger.info("암호화 전 비밀번호: {}", candidate.getCandidatePassword());
            logger.info("암호화된 비밀번호: {}", encrypted);
            
            candidate.setCandidatePassword(encrypted);
            
            // 저장할 값 로그 출력
            logger.info("저장할 값1 : {}", candidate);
            
            // 후보자 저장
            Candidate savedCandidate = candidateRepository.save(candidate);
            logger.info("저장된 후보자 ID: {}", savedCandidate.getCandidateId());
            
            // invitations 테이블 업데이트는 별도 트랜잭션에서 처리
            updateInvitationAsync(savedCandidate.getGithubLogin(), savedCandidate.getCandidateId());
            
            return savedCandidate;
        } catch (Exception e) {
            logger.error("회원 저장 중 오류 발생: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void updateInvitationAsync(String githubLogin, Long candidateId) {
        try {
            invitationRepository.updateCandidateIdByGithubLogin(githubLogin, candidateId);
            logger.info("✅ invitations 테이블 업데이트 성공: githubLogin={}, candidateId={}", githubLogin, candidateId);
        } catch (Exception invitationError) {
            logger.warn("⚠️ invitations 테이블 업데이트 실패 (회원가입은 성공): {}", invitationError.getMessage());
            // invitations 업데이트 실패해도 회원가입은 성공으로 처리
        }
    }

    @Transactional
    public Candidate updatePreferences(CandidatePreferencesDto preferencesDto) {
        try {
            Candidate candidate = candidateRepository.findById(preferencesDto.getCandidateId())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다. ID: " + preferencesDto.getCandidateId()));
            
            // 설정 정보 업데이트
            if (preferencesDto.getPreferredJob() != null) {
                candidate.setPreferredJob(preferencesDto.getPreferredJob());
            }
            if (preferencesDto.getPreferredRegion() != null) {
                candidate.setPreferredRegion(preferencesDto.getPreferredRegion());
            }
            if (preferencesDto.getPreferredSalary() != null) {
                candidate.setPreferredSalary(preferencesDto.getPreferredSalary());
            }
            if (preferencesDto.getPreferredCompanySize() != null) {
                candidate.setPreferredCompanySize(preferencesDto.getPreferredCompanySize());
            }
            if (preferencesDto.getPreferredCommuteTime() != null) {
                candidate.setPreferredCommuteTime(preferencesDto.getPreferredCommuteTime());
            }
            if (preferencesDto.getPreferredBenefit() != null) {
                candidate.setPreferredBenefit(preferencesDto.getPreferredBenefit());
            }
            
            // 업데이트 시간 설정
            candidate.setCandidateUpdatedAt(java.time.LocalDateTime.now());
            
            Candidate updatedCandidate = candidateRepository.save(candidate);
            logger.info("사용자 설정 업데이트 성공, 회원 ID: {}", updatedCandidate.getCandidateId());
            
            return updatedCandidate;
        } catch (Exception e) {
            logger.error("사용자 설정 업데이트 중 오류 발생: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public CandidatePreferencesDto getPreferences(Long candidateId) {
        try {
            Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다. ID: " + candidateId));
            
            return CandidatePreferencesDto.builder()
                .candidateId(candidate.getCandidateId())
                .preferredJob(candidate.getPreferredJob())
                .preferredRegion(candidate.getPreferredRegion())
                .preferredSalary(candidate.getPreferredSalary())
                .preferredCompanySize(candidate.getPreferredCompanySize())
                .preferredCommuteTime(candidate.getPreferredCommuteTime())
                .preferredBenefit(candidate.getPreferredBenefit())
                .build();
        } catch (Exception e) {
            logger.error("사용자 설정 조회 중 오류 발생: {}", e.getMessage(), e);
            throw e;
        }
    }
}

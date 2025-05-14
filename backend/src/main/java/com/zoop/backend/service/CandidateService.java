package com.zoop.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.zoop.backend.domain.entity.Candidate;
import com.zoop.backend.repository.CandidateRepository;

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

    public List<Candidate> findAll() {
        return candidateRepository.findAll();
    }

    public Candidate save(Candidate candidate) {
        try {
            // 비밀번호 암호화
            String encrypted = passwordEncoder.encode(candidate.getCandidatePassword());
            
            // 비밀번호 암호화 전/후 로그 출력
            logger.info("암호화 전 비밀번호: {}", candidate.getCandidatePassword());
            logger.info("암호화된 비밀번호: {}", encrypted);
            
            candidate.setCandidatePassword(encrypted);
            
            // 후보자 저장
            Candidate savedCandidate = candidateRepository.save(candidate);
            
            // 저장된 후보자 정보 로그 출력
            logger.info("회원 저장 성공, 회원 ID: {}", savedCandidate.getCandidateId());
            
            return savedCandidate;
        } catch (Exception e) {
            // 예외 발생 시 에러 로그 출력
            logger.error("회원 저장 중 오류 발생: {}", e.getMessage(), e);
            throw e;  // 예외를 다시 던져서 처리
        }
    }

    // 추가 메서드 작성 가능
}

package com.zoop.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zoop.backend.domain.entity.EmailContents;
import com.zoop.backend.repository.EmailContentsRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailContentsService {

    private final EmailContentsRepository emailContentsRepository;

    /**
     * 이메일 내용 저장
     */
    @Transactional
    public EmailContents saveEmailContents(EmailContents emailContents) {
        log.info("📧 이메일 내용 저장: emailId={}", emailContents.getEmailId());
        return emailContentsRepository.save(emailContents);
    }

    /**
     * 중복 검사 후 이메일 내용 찾기 또는 생성 (공고별)
     * 같은 공고에서 같은 제목+내용이 있으면 기존 것 반환, 없으면 새로 생성
     */
    @Transactional
    public EmailContents findOrCreateEmailContents(Long postId, String emailSubject, String emailContent) {
        log.info("📧 이메일 내용 찾기 또는 생성: postId={}, subject={}", postId, emailSubject);
        
        // 중복 검사 (공고별)
        Optional<EmailContents> existing = emailContentsRepository
            .findByPostIdAndEmailSubjectAndEmailContent(postId, emailSubject, emailContent);
        
        if (existing.isPresent()) {
            log.info("📧 기존 이메일 내용 재사용: emailId={}", existing.get().getEmailId());
            return existing.get();
        }
        
        // 새로 생성
        EmailContents newEmailContents = EmailContents.builder()
            .postId(postId)
            .emailSubject(emailSubject)
            .emailContent(emailContent)
            .build();
        
        EmailContents saved = emailContentsRepository.save(newEmailContents);
        log.info("📧 새 이메일 내용 생성: emailId={}, postId={}", saved.getEmailId(), postId);
        return saved;
    }

    /**
     * 중복 이메일 내용 존재 여부 확인 (공고별)
     */
    @Transactional(readOnly = true)
    public boolean isDuplicateContent(Long postId, String emailSubject, String emailContent) {
        return emailContentsRepository.existsByPostIdAndEmailSubjectAndEmailContent(postId, emailSubject, emailContent);
    }

    /**
     * 이메일 내용 수정
     */
    @Transactional
    public EmailContents updateEmailContents(Long emailId, String emailSubject, String emailContent) {
        log.info("📧 이메일 내용 수정: emailId={}", emailId);
        
        EmailContents existingEmail = emailContentsRepository.findById(emailId)
            .orElseThrow(() -> new RuntimeException("이메일 내용을 찾을 수 없습니다: " + emailId));
        
        existingEmail.setEmailSubject(emailSubject);
        existingEmail.setEmailContent(emailContent);
        
        return emailContentsRepository.save(existingEmail);
    }

    /**
     * 최근 생성된 이메일 템플릿들 조회 (재사용 권장용 - 전체)
     */
    @Transactional(readOnly = true)
    public List<EmailContents> getRecentTemplates() {
        log.debug("📧 최근 이메일 템플릿 조회 (전체)");
        return emailContentsRepository.findTop10ByOrderByCreatedAtDesc();
    }

    /**
     * 특정 공고의 최근 생성된 이메일 템플릿들 조회
     */
    @Transactional(readOnly = true)
    public List<EmailContents> getRecentTemplatesByPost(Long postId) {
        log.debug("📧 공고별 최근 이메일 템플릿 조회: postId={}", postId);
        return emailContentsRepository.findTop10ByPostIdOrderByCreatedAtDesc(postId);
    }

    /**
     * 특정 공고의 모든 이메일 템플릿들 조회
     */
    @Transactional(readOnly = true)
    public List<EmailContents> getAllTemplatesByPost(Long postId) {
        log.debug("📧 공고별 모든 이메일 템플릿 조회: postId={}", postId);
        return emailContentsRepository.findByPostIdOrderByCreatedAtDesc(postId);
    }

    /**
     * 제목으로 유사한 템플릿 검색 (전체)
     */
    @Transactional(readOnly = true)
    public List<EmailContents> findTemplatesBySubject(String keyword) {
        log.debug("📧 제목으로 템플릿 검색 (전체): keyword={}", keyword);
        return emailContentsRepository.findByEmailSubjectContaining(keyword);
    }

    /**
     * 특정 공고의 제목으로 유사한 템플릿 검색
     */
    @Transactional(readOnly = true)
    public List<EmailContents> findTemplatesByPostAndSubject(Long postId, String keyword) {
        log.debug("📧 공고별 제목으로 템플릿 검색: postId={}, keyword={}", postId, keyword);
        return emailContentsRepository.findByPostIdAndEmailSubjectContaining(postId, keyword);
    }

    /**
     * 이메일 ID로 조회
     */
    @Transactional(readOnly = true)
    public Optional<EmailContents> findById(Long emailId) {
        return emailContentsRepository.findById(emailId);
    }

    /**
     * 이메일 ID로 삭제
     */
    @Transactional
    public void deleteById(Long emailId) {
        log.info("📧 이메일 내용 삭제: emailId={}", emailId);
        emailContentsRepository.deleteById(emailId);
    }
} 
package com.zoop.backend.service;

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
     * 커스텀 이메일 내용 저장
     */
    @Transactional
    public EmailContents saveEmailContents(EmailContents emailContents) {
        log.info("📧 커스텀 이메일 내용 저장: invitationId={}", emailContents.getInvitationId());
        return emailContentsRepository.save(emailContents);
    }

    /**
     * invitation_id로 커스텀 이메일 내용 조회
     */
    @Transactional(readOnly = true)
    public Optional<EmailContents> findByInvitationId(Long invitationId) {
        log.debug("📧 커스텀 이메일 내용 조회: invitationId={}", invitationId);
        return emailContentsRepository.findByInvitationId(invitationId);
    }

    /**
     * invitation_id로 커스텀 이메일 내용 존재 여부 확인
     */
    @Transactional(readOnly = true)
    public boolean existsByInvitationId(Long invitationId) {
        return emailContentsRepository.existsByInvitationId(invitationId);
    }

    /**
     * 커스텀 이메일 내용 수정
     */
    @Transactional
    public EmailContents updateEmailContents(Long emailId, String emailSubject, String emailContent) {
        log.info("📧 커스텀 이메일 내용 수정: emailId={}", emailId);
        
        EmailContents existingEmail = emailContentsRepository.findById(emailId)
            .orElseThrow(() -> new RuntimeException("이메일 내용을 찾을 수 없습니다: " + emailId));
        
        existingEmail.setEmailSubject(emailSubject);
        existingEmail.setEmailContent(emailContent);
        
        return emailContentsRepository.save(existingEmail);
    }

    /**
     * invitation_id로 커스텀 이메일 내용 삭제
     */
    @Transactional
    public void deleteByInvitationId(Long invitationId) {
        log.info("📧 커스텀 이메일 내용 삭제: invitationId={}", invitationId);
        emailContentsRepository.deleteByInvitationId(invitationId);
    }

    /**
     * 이메일 ID로 커스텀 이메일 내용 삭제
     */
    @Transactional
    public void deleteById(Long emailId) {
        log.info("📧 커스텀 이메일 내용 삭제: emailId={}", emailId);
        emailContentsRepository.deleteById(emailId);
    }
} 
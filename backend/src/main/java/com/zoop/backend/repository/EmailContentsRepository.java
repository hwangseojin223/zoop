package com.zoop.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zoop.backend.domain.entity.EmailContents;

@Repository
public interface EmailContentsRepository extends JpaRepository<EmailContents, Long> {

    // 중복 검사용 - 같은 공고에서 같은 제목+내용의 이메일이 이미 있는지 확인
    Optional<EmailContents> findByPostIdAndEmailSubjectAndEmailContent(Long postId, String emailSubject, String emailContent);
    
    // 중복 존재 여부 확인 (공고별)
    boolean existsByPostIdAndEmailSubjectAndEmailContent(Long postId, String emailSubject, String emailContent);

    // 제목으로 검색 (유사한 템플릿 찾기용)
    List<EmailContents> findByEmailSubjectContaining(String keyword);
    
    // 특정 공고의 제목으로 검색 (공고별 유사 템플릿)
    List<EmailContents> findByPostIdAndEmailSubjectContaining(Long postId, String keyword);

    // 최근 생성된 이메일 템플릿 조회 (재사용 권장용 - 전체)
    List<EmailContents> findTop10ByOrderByCreatedAtDesc();
    
    // 특정 공고의 최근 생성된 이메일 템플릿 조회
    List<EmailContents> findTop10ByPostIdOrderByCreatedAtDesc(Long postId);
    
    // 특정 공고의 모든 이메일 템플릿 조회
    List<EmailContents> findByPostIdOrderByCreatedAtDesc(Long postId);
} 
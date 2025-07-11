package com.zoop.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zoop.backend.domain.entity.Post;

public interface PostRepository extends JpaRepository<Post, Long> {
    // 회사별 공고 목록 조회 (최신순)
    List<Post> findByCompanyIdOrderByPostCreatedAtDesc(Long companyId);
    // 모든 공고 목록 조회 (최신순)
    List<Post> findAllByOrderByPostCreatedAtDesc();
    // 상태별 공고 목록 조회 (최신순)
    List<Post> findByPostStatusOrderByPostCreatedAtDesc(String postStatus);
    // companyId로 필터링
    List<Post> findByCompanyId(Long companyId);
}

package com.zoop.backend.repository;

import com.zoop.backend.domain.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    // 회사별 공고 목록 조회 (최신순)
    List<Post> findByCompanyIdOrderByPostCreatedAtDesc(Long companyId);
    
    // 모든 공고 목록 조회 (최신순)
    List<Post> findAllByOrderByPostCreatedAtDesc();
    
    // 상태별 공고 목록 조회 (최신순)
    List<Post> findByPostStatusOrderByPostCreatedAtDesc(String postStatus);
}

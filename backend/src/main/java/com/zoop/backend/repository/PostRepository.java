package com.zoop.backend.repository;

import com.zoop.backend.domain.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    // 회사별 공고 목록 조회 (최신순)
    List<Post> findByCompanyIdOrderByPostCreatedAtDesc(Long companyId);
    
    // 모든 공고 목록 조회 (최신순)
    List<Post> findAllByOrderByPostCreatedAtDesc();
    
    // 상태별 공고 목록 조회 (최신순)
    List<Post> findByPostStatusOrderByPostCreatedAtDesc(String postStatus);
    
    // 활성 상태이고 마감일이 지나지 않은 공고 조회
    @Query("SELECT p FROM Post p WHERE p.postStatus = :status AND (p.postExpiryDate IS NULL OR p.postExpiryDate >= :currentDate) ORDER BY p.postCreatedAt DESC")
    List<Post> findActivePostsNotExpired(@Param("status") String status, @Param("currentDate") LocalDate currentDate);
}

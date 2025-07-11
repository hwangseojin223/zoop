package com.zoop.backend.repository;

<<<<<<< HEAD
import com.zoop.backend.domain.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
=======
>>>>>>> origin/test-experiment-zoop
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zoop.backend.domain.entity.Post;

public interface PostRepository extends JpaRepository<Post, Long> {
    // 회사별 공고 목록 조회 (최신순)
    List<Post> findByCompanyIdOrderByPostCreatedAtDesc(Long companyId);
    // 모든 공고 목록 조회 (최신순)
    List<Post> findAllByOrderByPostCreatedAtDesc();
<<<<<<< HEAD
    
    // 상태별 공고 목록 조회 (최신순)
    List<Post> findByPostStatusOrderByPostCreatedAtDesc(String postStatus);
    
    // 활성 상태이고 마감일이 지나지 않은 공고 조회
    @Query("SELECT p FROM Post p WHERE p.postStatus = :status AND (p.postExpiryDate IS NULL OR p.postExpiryDate >= :currentDate) ORDER BY p.postCreatedAt DESC")
    List<Post> findActivePostsNotExpired(@Param("status") String status, @Param("currentDate") LocalDate currentDate);
=======
    // 상태별 공고 목록 조회 (최신순)
    List<Post> findByPostStatusOrderByPostCreatedAtDesc(String postStatus);
    // companyId로 필터링
    List<Post> findByCompanyId(Long companyId);
>>>>>>> origin/test-experiment-zoop
}

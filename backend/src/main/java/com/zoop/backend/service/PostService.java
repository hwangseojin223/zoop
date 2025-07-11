package com.zoop.backend.service;

import com.zoop.backend.domain.dto.PostingRequestDto;
import com.zoop.backend.domain.entity.CompanyAdmin;
import com.zoop.backend.domain.entity.Post;
import com.zoop.backend.repository.CompanyAdminRepository;
import com.zoop.backend.repository.PostRepository;
import lombok.RequiredArgsConstructor;
<<<<<<< HEAD

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.stereotype.Service;
=======
>>>>>>> origin/test-experiment-zoop

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final CompanyAdminRepository companyAdminRepository; // ✅ 여기에 주입 선언

    // ✅ 1. 오버로드된 createPost(dto, loginId) 메서드 추가
    public Post createPost(PostingRequestDto dto, String loginId) {
        CompanyAdmin admin = companyAdminRepository.findByCompanyAdminLogin(loginId)
            .orElseThrow(() -> new RuntimeException("존재하지 않는 관리자입니다."));

        dto.setCompanyAdminId(admin.getCompanyAdminId());
        dto.setCompanyId(admin.getCompany().getCompanyId());

        return createPost(dto); // 기존 메서드 호출
    }
    

    public Post createPost(PostingRequestDto dto) {
        Post post = new Post();

        post.setCompanyId(dto.getCompanyId());
        post.setCompanyAdminId(dto.getCompanyAdminId());
        post.setPostTitle(dto.getPostTitle());
        post.setPostDescription(dto.getPostDescription());
        post.setPostProgrammingLanguage(dto.getPostProgrammingLanguage());
        post.setPostLocation(dto.getPostLocation());
        post.setPostHeadcount(dto.getPostHeadcount());
        post.setPostSalaryStart(dto.getPostSalaryStart());
        post.setPostSalaryEnd(dto.getPostSalaryEnd());

        // 날짜 처리
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        post.setPostPostedDate(dto.getPostPostedDate());
        post.setPostExpiryDate(dto.getPostExpiryDate());
        
        post.setPostStatus(dto.getPostStatus());
        post.setPostIdealCandidate(dto.getPostIdealCandidate());

        post.setPostCreatedAt(LocalDateTime.now());
        post.setPostUpdatedAt(LocalDateTime.now());

        return postRepository.save(post);
    }

    public Post getPostById(Long postId) {
        return postRepository.findById(postId).orElse(null);
    }

    // 회사별 공고 목록 조회 메서드 추가
    public List<Post> getPostsByCompanyId(Long companyId) {
        return postRepository.findByCompanyIdOrderByPostCreatedAtDesc(companyId);
    }

    // 회사 관리자의 loginId로 해당 회사의 공고 목록 조회 메서드 추가
    public List<Post> getPostsByCompanyAdmin(String loginId) {
        CompanyAdmin admin = companyAdminRepository.findByCompanyAdminLogin(loginId)
            .orElseThrow(() -> new RuntimeException("존재하지 않는 관리자입니다."));
        
        return postRepository.findByCompanyIdOrderByPostCreatedAtDesc(admin.getCompany().getCompanyId());
    }

    // 모든 공고 목록 조회 메서드 추가
    public List<Post> getAllPosts() {
        return postRepository.findAllByOrderByPostCreatedAtDesc();
    }

    // 공개 공고 목록 조회 메서드 추가
    public List<Post> getPublicPosts() {
<<<<<<< HEAD
        // 조회 전에 만료된 공고들 상태 업데이트
        updateExpiredPosts();
        
        return postRepository.findActivePostsNotExpired("ACTIVE", LocalDate.now());
=======
        return postRepository.findByPostStatusOrderByPostCreatedAtDesc("ACTIVE");
>>>>>>> origin/test-experiment-zoop
    }

    // 공고 업데이트 메서드 추가
    public Post updatePost(Long postId, PostingRequestDto dto) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("해당 공고를 찾을 수 없습니다."));
        
        if (dto.getPostTitle() != null) post.setPostTitle(dto.getPostTitle());
        if (dto.getPostDescription() != null) post.setPostDescription(dto.getPostDescription());
        if (dto.getPostProgrammingLanguage() != null) post.setPostProgrammingLanguage(dto.getPostProgrammingLanguage());
        if (dto.getPostLocation() != null) post.setPostLocation(dto.getPostLocation());
        if (dto.getPostHeadcount() != null) post.setPostHeadcount(dto.getPostHeadcount());
        if (dto.getPostSalaryStart() != null) post.setPostSalaryStart(dto.getPostSalaryStart());
        if (dto.getPostSalaryEnd() != null) post.setPostSalaryEnd(dto.getPostSalaryEnd());
        if (dto.getPostPostedDate() != null) post.setPostPostedDate(dto.getPostPostedDate());
        if (dto.getPostExpiryDate() != null) post.setPostExpiryDate(dto.getPostExpiryDate());
        if (dto.getPostStatus() != null) post.setPostStatus(dto.getPostStatus());
        
        post.setPostUpdatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    // 인재상 저장 메서드 추가
    public Post updateIdealCandidate(Long postId, String idealCandidate) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("해당 공고를 찾을 수 없습니다."));
        
        post.setPostIdealCandidate(idealCandidate);
        post.setPostUpdatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    // 만료된 공고들을 INACTIVE 상태로 업데이트하는 메서드 추가
    public int updateExpiredPosts() {
        List<Post> allPosts = postRepository.findAll();
        int updatedCount = 0;
        
        for (Post post : allPosts) {
            if (post.getPostExpiryDate() != null && 
                post.getPostExpiryDate().isBefore(LocalDate.now()) && 
                "ACTIVE".equals(post.getPostStatus())) {
                
                post.setPostStatus("INACTIVE");
                post.setPostUpdatedAt(LocalDateTime.now());
                postRepository.save(post);
                updatedCount++;
                
                System.out.println("만료된 공고 상태 업데이트: " + post.getPostTitle() + 
                                 " (만료일: " + post.getPostExpiryDate() + ")");
            }
        }
        
        System.out.println("총 " + updatedCount + "개의 만료된 공고 상태를 업데이트했습니다.");
        return updatedCount;
    }

    // 만료된 공고 목록 조회 메서드 추가
    public List<Post> getExpiredPosts() {
        List<Post> allPosts = postRepository.findAll();
        return allPosts.stream()
            .filter(post -> post.getPostExpiryDate() != null && 
                           post.getPostExpiryDate().isBefore(LocalDate.now()))
            .toList();
    }
}

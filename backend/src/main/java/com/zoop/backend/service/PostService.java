package com.zoop.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.zoop.backend.domain.dto.PostingRequestDto;
import com.zoop.backend.domain.entity.CompanyAdmin;
import com.zoop.backend.domain.entity.Post;
import com.zoop.backend.repository.CompanyAdminRepository;
import com.zoop.backend.repository.PostRepository;
import lombok.RequiredArgsConstructor;

@Service
public class PostService {

    private PostRepository postRepository;
    private CompanyAdminRepository companyAdminRepository;
    
    @Autowired
    public void setPostRepository(PostRepository postRepository) {
        this.postRepository = postRepository;
    }
    
    @Autowired
    public void setCompanyAdminRepository(CompanyAdminRepository companyAdminRepository) {
        this.companyAdminRepository = companyAdminRepository;
    }

    public Post getPostById(Long postId) {
        Optional<Post> post = postRepository.findById(postId);
        return post.orElse(null);
    }

    // 오버로드된 createPost(dto, loginId) 메서드
    public Post createPost(PostingRequestDto dto, String loginId) {
        CompanyAdmin admin = companyAdminRepository.findByLoginId(loginId)
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

    // 회사별 공고 목록 조회 메서드 추가
    public List<Post> getPostsByCompanyId(Long companyId) {
        return postRepository.findByCompanyIdOrderByPostCreatedAtDesc(companyId);
    }

    // 모든 공고 목록 조회 메서드 추가
    public List<Post> getAllPosts() {
        return postRepository.findAllByOrderByPostCreatedAtDesc();
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
}

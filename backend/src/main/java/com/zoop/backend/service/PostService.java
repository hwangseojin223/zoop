package com.zoop.backend.service;

import com.zoop.backend.domain.dto.PostingRequestDto;
import com.zoop.backend.domain.entity.CompanyAdmin;
import com.zoop.backend.domain.entity.Post;
import com.zoop.backend.repository.CompanyAdminRepository;
import com.zoop.backend.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

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

        post.setPostCreatedAt(LocalDateTime.now());
        post.setPostUpdatedAt(LocalDateTime.now());

        return postRepository.save(post);
    }
}

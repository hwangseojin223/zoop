package com.zoop.backend.service;

import com.zoop.backend.domain.dto.PostingRequestDto;
import com.zoop.backend.domain.entity.CompanyAdmin;
import com.zoop.backend.domain.entity.Post;
import com.zoop.backend.repository.CompanyAdminRepository;
import com.zoop.backend.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final CompanyAdminRepository companyAdminRepository; // ✅ 여기에 주입 선언

    public Post save(PostingRequestDto dto, String loginId) {
        CompanyAdmin admin = companyAdminRepository.findByLoginId(loginId)  // ✅ 클래스 → 인스턴스
            .orElseThrow(() -> new RuntimeException("해당 로그인 ID의 관리자 없음"));

        Post post = Post.builder()
            .companyAdminId(admin.getCompanyAdminId())
            .companyId(admin.getCompany().getCompanyId())
            .postTitle(dto.getPostTitle())
            .postDescription(dto.getPostDescription())
            .postProgrammingLanguage(dto.getPostProgrammingLanguage())
            .postLocation(dto.getPostLocation())
            .postHeadcount(dto.getPostHeadcount())
            .postSalaryStart(dto.getPostSalaryStart())
            .postSalaryEnd(dto.getPostSalaryEnd())
            .postPostedDate(dto.getPostPostedDate())
            .postExpiryDate(dto.getPostExpiryDate())
            .postStatus(dto.getPostStatus())
            .build();

        return postRepository.save(post);
    }
}

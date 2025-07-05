package com.zoop.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zoop.backend.domain.entity.Post;

public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findByCompanyId(Long companyId); // ✅ companyId로 필터링
}

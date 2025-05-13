package com.zoop.backend.repository;

import com.zoop.backend.domain.entity.CompanyAdmin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CompanyAdminRepository extends JpaRepository<CompanyAdmin, Long> {
    
    // 중복 확인용
    boolean existsByEmail(String email);
    boolean existsByLoginId(String loginId);

    // 로그인용
    Optional<CompanyAdmin> findByLoginId(String loginId);
}

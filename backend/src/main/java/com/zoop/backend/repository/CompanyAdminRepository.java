package com.zoop.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zoop.backend.domain.entity.CompanyAdmin;

public interface CompanyAdminRepository extends JpaRepository<CompanyAdmin, Long> {
    
    // 중복 확인용
    boolean existsByCompanyAdminEmail(String email);
    boolean existsByCompanyAdminLogin(String loginId);

    // 로그인용
    Optional<CompanyAdmin> findByCompanyAdminLogin(String loginId);
}

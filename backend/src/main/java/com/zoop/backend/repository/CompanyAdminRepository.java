package com.zoop.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.zoop.backend.domain.entity.CompanyAdmin;

public interface CompanyAdminRepository extends JpaRepository<CompanyAdmin, Long> {
    
    // 중복 확인용
    boolean existsByCompanyAdminEmail(String email);
    boolean existsByCompanyAdminLogin(String loginId);

    // 로그인용
    Optional<CompanyAdmin> findByCompanyAdminLogin(String loginId);
    
    // Company 정보를 함께 조회
    @Query("SELECT ca FROM CompanyAdmin ca JOIN FETCH ca.company WHERE ca.companyAdminId = :adminId")
    Optional<CompanyAdmin> findByIdWithCompany(@Param("adminId") Long adminId);
}

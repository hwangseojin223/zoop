package com.zoop.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.zoop.backend.domain.entity.CompanyAdmin;

public interface CompanyAdminRepository extends JpaRepository<CompanyAdmin, Long> {
    boolean existsByEmail(String email);
    boolean existsByLoginId(String loginId);
   // Spring Data JPA 쿼리 메소드 기능을 사용하여 특정 조건으로 엔티티를 조회하는 메소드를 선언합니다.
    // 사용자 로그인 시 사용될 조회 메소드 선언 (관리자 로그인 ID 또는 이메일로 조회)
    @Query("SELECT ca FROM CompanyAdmin ca WHERE ca.loginId = :loginId")
    Optional<CompanyAdmin> findByCompanyAdminLogin(@Param("loginId") String companyAdminLogin); // companyAdminLogin 필드로 조회
     @Query("SELECT ca FROM CompanyAdmin ca WHERE ca.email = :email") 
    Optional<CompanyAdmin> findByCompanyAdminEmail(@Param("email") String companyAdminEmail); // companyAdminEmail 필드로 조회

}
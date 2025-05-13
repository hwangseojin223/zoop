package com.zoop.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zoop.backend.domain.entity.CompanyAdmin;

public interface CompanyAdminRepository extends JpaRepository<CompanyAdmin, Long> {
    boolean existsByEmail(String email);
    boolean existsByLoginId(String loginId);
}
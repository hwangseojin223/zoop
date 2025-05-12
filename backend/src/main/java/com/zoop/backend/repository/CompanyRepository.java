package com.zoop.backend.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.zoop.backend.domain.entity.Company;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    boolean existsByBusinessNumber(String businessNumber);
}
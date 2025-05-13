package com.zoop.backend.service;

import com.zoop.backend.domain.entity.Company;
import com.zoop.backend.repository.CompanyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    @Transactional
    public Company saveCompany(Company company) {
        System.out.println("📦 저장 시도 중...");
        return companyRepository.save(company);
    }
}

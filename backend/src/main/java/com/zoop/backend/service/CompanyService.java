package com.zoop.backend.service;

import com.zoop.backend.domain.entity.Company;
import com.zoop.backend.repository.CompanyRepository;
import org.springframework.stereotype.Service;

@Service
public class CompanyService {

    private final CompanyRepository repository;

    public CompanyService(CompanyRepository repository) {
        this.repository = repository;
    }

    public Company saveCompany(Company company) {
        if (repository.existsByBusinessNumber(company.getBusinessNumber())) {
            throw new IllegalArgumentException("이미 등록된 사업자등록번호입니다.");
        }
        return repository.save(company);
    }
}
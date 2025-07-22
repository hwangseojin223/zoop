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

    @Transactional(readOnly = true)
    public Company getCompanyById(Long companyId) {
        return companyRepository.findById(companyId).orElse(null);
    }
    
    @Transactional
    public Company updateCompany(Long companyId, com.zoop.backend.domain.dto.CompanyDto dto) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("회사를 찾을 수 없습니다."));
        
        if (dto.getCompanyName() != null) company.setCompanyName(dto.getCompanyName());
        if (dto.getBusinessNumber() != null) company.setBusinessNumber(dto.getBusinessNumber());
        if (dto.getCeoName() != null) company.setCeoName(dto.getCeoName());
        if (dto.getCompanyAddress() != null) company.setCompanyAddress(dto.getCompanyAddress());
        
        return companyRepository.save(company);
    }
}

package com.zoop.backend.service;

import com.zoop.backend.domain.entity.Company;
import com.zoop.backend.domain.entity.CompanyAdmin;
import com.zoop.backend.repository.CompanyAdminRepository;
import com.zoop.backend.repository.CompanyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class CompanyAdminService {

    private final CompanyAdminRepository adminRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    
    public boolean isLoginIdDuplicate(String loginId) {
        return adminRepository.existsByLoginId(loginId);
    }
    

    public CompanyAdminService(CompanyAdminRepository adminRepository,
                               CompanyRepository companyRepository,
                               PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.companyRepository = companyRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // @Transactional
    // public CompanyAdmin registerAdmin(Long companyId, CompanyAdmin admin) {
    //     Company company = companyRepository.findById(companyId)
    //             .orElseThrow(() -> new IllegalArgumentException("회사 정보를 찾을 수 없습니다."));

    //     admin.setCompany(company);

    //     // 여기서 비밀번호 해싱
    //     admin.setPassword(passwordEncoder.encode(admin.getPassword()));

    //     return adminRepository.save(admin);
    // }
    
    @Transactional
    public CompanyAdmin registerAdmin(Long companyId, CompanyAdmin admin) {
    System.out.println("✅ 관리자 저장 시작");
    System.out.println("LoginId: " + admin.getLoginId());
    System.out.println("CompanyId: " + companyId);

    Company company = companyRepository.findById(companyId)
            .orElseThrow(() -> new IllegalArgumentException("회사 정보를 찾을 수 없습니다."));

    admin.setCompany(company);
    admin.setPassword(passwordEncoder.encode(admin.getPassword()));

    CompanyAdmin saved = adminRepository.save(admin);
    System.out.println("✅ 저장 완료: ID = " + saved.getCompanyAdminId());

    return saved;
}

}

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
        return adminRepository.existsByCompanyAdminLogin(loginId);
    }
    

    public CompanyAdminService(CompanyAdminRepository adminRepository,
                               CompanyRepository companyRepository,
                               PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.companyRepository = companyRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public CompanyAdmin getAdminById(Long id) {
        try {
            System.out.println("🔍 [Service] getAdminById 호출됨: " + id);
            CompanyAdmin admin = adminRepository.findByIdWithCompany(id)
                    .orElseThrow(() -> new RuntimeException("해당 관리자 없음"));
            System.out.println("✅ [Service] 관리자 조회 성공: " + admin.getCompanyAdminId());
            System.out.println("✅ [Service] 회사 정보: " + (admin.getCompany() != null ? admin.getCompany().getCompanyId() : "null"));
            return admin;
        } catch (Exception e) {
            System.out.println("❌ [Service] getAdminById 에러: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    public CompanyAdmin getAdminByLoginId(String loginId) {
        return adminRepository.findByCompanyAdminLogin(loginId)
                .orElseThrow(() -> new RuntimeException("해당 관리자 없음"));
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

@Transactional
public CompanyAdmin updateAdmin(Long adminId, CompanyAdmin adminUpdate) {
    CompanyAdmin admin = adminRepository.findByIdWithCompany(adminId)
            .orElseThrow(() -> new RuntimeException("관리자를 찾을 수 없습니다."));
    
    admin.setName(adminUpdate.getName());
    admin.setEmail(adminUpdate.getEmail());
    
    CompanyAdmin saved = adminRepository.save(admin);
    
    // Company 정보를 명시적으로 로드하여 프록시 문제 해결
    saved.getCompany().getCompanyId();
    
    return saved;
}

@Transactional
public void changePassword(String loginId, String currentPassword, String newPassword) {
    CompanyAdmin admin = adminRepository.findByCompanyAdminLogin(loginId)
            .orElseThrow(() -> new RuntimeException("관리자를 찾을 수 없습니다."));
    
    // 현재 비밀번호 확인
    if (!passwordEncoder.matches(currentPassword, admin.getPassword())) {
        throw new RuntimeException("현재 비밀번호가 일치하지 않습니다.");
    }
    
    // 새 비밀번호로 변경
    admin.setPassword(passwordEncoder.encode(newPassword));
    adminRepository.save(admin);
}

}

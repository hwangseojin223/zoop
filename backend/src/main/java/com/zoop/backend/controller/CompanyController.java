package com.zoop.backend.controller;

import com.zoop.backend.domain.entity.Company;
import com.zoop.backend.domain.dto.CompanyDto;
import com.zoop.backend.service.CompanyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import java.util.Map;

@RestController
@RequestMapping("/api/companies")
@CrossOrigin(origins = "http://localhost:3000")
public class CompanyController {

    private final CompanyService service;

    public CompanyController(CompanyService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> registerCompany(@RequestBody CompanyDto dto) {
        System.out.println("✅ 회사 등록 요청 수신");
        System.out.println(" - 사업자번호: " + dto.getBusinessNumber());
        System.out.println(" - 회사명: " + dto.getCompanyName());
        System.out.println(" - 대표자명: " + dto.getCeoName());
        System.out.println(" - 주소: " + dto.getCompanyAddress());

        Company company = new Company();
        company.setBusinessNumber(dto.getBusinessNumber());
        company.setCompanyName(dto.getCompanyName());
        company.setCeoName(dto.getCeoName());
        company.setCompanyAddress(dto.getCompanyAddress());

        Company saved = service.saveCompany(company);
        return ResponseEntity.ok(Map.of("companyId", saved.getCompanyId()));
    }

    // 매핑 실패 디버깅용 임시 엔드포인트
    @PostMapping("/debug")
    public ResponseEntity<?> debug(@RequestBody Map<String, Object> raw) {
        System.out.println("🐛 수신된 RAW JSON = " + raw);
        return ResponseEntity.ok().build();
    }
}

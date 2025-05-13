package com.zoop.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zoop.backend.domain.dto.CompanyDto;
import com.zoop.backend.domain.entity.Company;
import com.zoop.backend.service.CompanyService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name="CompanyController", description="회사 정보 관련 API")
@RestController
@RequestMapping("/api/companies")
@CrossOrigin(origins = "http://localhost:3000")
public class CompanyController {

    private final CompanyService service;

    public CompanyController(CompanyService service) {
        this.service = service;
    }

    @Operation(summary="회사 정보 등록", description="새로운 회사 정보를 시스템에 등록합니다.")
    @ApiResponses(value={
        @ApiResponse(responseCode="200", description="회사 정보 등록 성공 및 등록된 회사 정보 반환",
            content=@Content(schema=@Schema(implementation=Company.class))),
        @ApiResponse(responseCode="400", description="잘못된 요청(예: 필수 필드 누락 등)")
    })
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

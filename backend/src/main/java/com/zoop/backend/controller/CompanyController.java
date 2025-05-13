package com.zoop.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    public ResponseEntity<Company> registerCompany(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description="등록할 회사 정보",
            required=true,
            content=@Content(schema=@Schema(implementation=Company.class))
        )    
        @RequestBody Company company) {
        Company saved = service.saveCompany(company);
        return ResponseEntity.ok(saved);
    }
}

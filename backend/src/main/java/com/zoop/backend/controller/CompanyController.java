package com.zoop.backend.controller;

import com.zoop.backend.domain.entity.Company;
import com.zoop.backend.service.CompanyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService service;

    public CompanyController(CompanyService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Company> registerCompany(@RequestBody Company company) {
        Company saved = service.saveCompany(company);
        return ResponseEntity.ok(saved);
    }
}

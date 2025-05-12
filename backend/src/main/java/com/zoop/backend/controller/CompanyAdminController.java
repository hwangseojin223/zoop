package com.zoop.backend.controller;

import com.zoop.backend.domain.entity.CompanyAdmin;
import com.zoop.backend.service.CompanyAdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/companyadmins")
public class CompanyAdminController {

    private final CompanyAdminService adminService;

    public CompanyAdminController(CompanyAdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping
    public ResponseEntity<CompanyAdmin> register(@RequestBody CompanyAdmin admin) {
        System.out.println("✅ 컨트롤러 도착");
        if (admin.getCompany() == null || admin.getCompany().getCompanyId() == null) {
            return ResponseEntity.badRequest().build();
        }
        CompanyAdmin saved = adminService.registerAdmin(admin.getCompany().getCompanyId(), admin);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/check-id")
    public ResponseEntity<String> checkLoginIdDuplicate(@RequestParam String loginId) {
        boolean exists = adminService.isLoginIdDuplicate(loginId);
        return exists
            ? ResponseEntity.ok("이미 사용 중인 아이디입니다.")
            : ResponseEntity.ok("사용 가능한 아이디입니다.");
    }
} 
package com.zoop.backend.controller;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.zoop.backend.domain.entity.Company;
import com.zoop.backend.domain.entity.CompanyAdmin;
import com.zoop.backend.service.CompanyAdminService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name="CompanyAdminController", description="회사 관리자 관련 API")
@RestController
@RequestMapping("/api/companyadmins")
public class CompanyAdminController {

    private final CompanyAdminService adminService;

    public CompanyAdminController(CompanyAdminService adminService) {
        this.adminService = adminService;
    }

    @Operation(summary="회사 관리자 등록", description="새로운 회사 관리자 정보를 등록합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode="200", description="관리자 등록 성공 및 등록된 관리자 정보 반환",
            content=@Content(schema=@Schema(implementation=String.class)))
    })
    @PostMapping
    public ResponseEntity<CompanyAdmin> register(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description="등록할 회사 관리자 정보 (회사 ID 포함)",
            required=true,
            content=@Content(schema=@Schema(implementation=CompanyAdmin.class))
        )    
        @RequestBody CompanyAdmin admin) {
        System.out.println("✅ 컨트롤러 도착");
        if (admin.getCompany() == null || admin.getCompany().getCompanyId() == null) {
            return ResponseEntity.badRequest().build();
        }
        CompanyAdmin saved = adminService.registerAdmin(admin.getCompany().getCompanyId(), admin);
        return ResponseEntity.ok(saved);
    }

    @Operation(summary="로그인 아이디 중복 확인", description="입력된 로그인 아이디의 사용 가능 여부를 확인합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode="200", description="아이디 사용 가능 또는 중복 여부 메시지 반환",
            content=@Content(schema=@Schema(implementation=String.class)))
    })
    @GetMapping("/check-id")
    public ResponseEntity<String> checkLoginIdDuplicate(
            @Parameter(description="중복 확인 할 로그인 아이디", required=true, example="new_admin_id")
            @RequestParam String loginId) {
        boolean exists = adminService.isLoginIdDuplicate(loginId);
        return exists
            ? ResponseEntity.ok("이미 사용 중인 아이디입니다.")
            : ResponseEntity.ok("사용 가능한 아이디입니다.");
    }

    @Operation(summary = "관리자 ID로 회사 정보 조회", description = "관리자 ID를 통해 해당 관리자가 속한 회사의 정보를 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "회사 정보 반환",
            content=@Content(schema = @Schema(implementation = Map.class)))
        
        @ApiResponse(responseCode="404", description="관리자를 찾을 수 없음"), // 404 응답 추가 (필요시)
        @ApiResponse(responseCode="500", description="서버 오류") // 500 응답 추가 (필요시)
    })
    @GetMapping("/info/{adminId}")
    public ResponseEntity<?> getCompanyInfoByAdminId(
        @Parameter(description = "조회할 회사 관리자의 ID", required = true, example = "123")
        @PathVariable Long adminId) {
        System.out.println("✅ [API 호출됨] /info/" + adminId);
        CompanyAdmin admin = adminService.getAdminById(adminId); // service에서 admin + company join 조회
        Company company = admin.getCompany();

        return ResponseEntity.ok(Map.of(
            "companyName", company.getCompanyName(),
            "businessNumber", company.getBusinessNumber(),
            "address", company.getCompanyAddress(),
            "ceoName", company.getCeoName(),
            "adminName", admin.getName(),
            "email", admin.getEmail()
        ));
    }

}

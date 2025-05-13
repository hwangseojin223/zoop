package com.zoop.backend.domain.dto;

public class CompanyAdminDto {
    private String loginId;
    private String name;
    private String email;
    private String password;
    private Long companyId;

    // Getter/Setter 생략 가능 (Lombok 사용 시 @Getter/@Setter)
    public String getLoginId() { return loginId; }
    public void setLoginId(String loginId) { this.loginId = loginId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
}
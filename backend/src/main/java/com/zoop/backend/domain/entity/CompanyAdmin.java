package com.zoop.backend.domain.entity;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;

@Entity
@Table(name = "company_admins")
@Schema(description="회사 관리자 정보를 나타내는 엔티티")
public class CompanyAdmin {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "company_admins_seq_gen")
    @SequenceGenerator(name = "company_admins_seq_gen", sequenceName = "company_admins_seq", allocationSize = 1)
    @Schema(description="관리자 고유 ID", example="101", accessMode=AccessMode.READ_ONLY)
    private Long companyAdminId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    @Schema(description="소속 회사 정보", requiredMode=RequiredMode.REQUIRED)
    private Company company;

    @Column(name = "company_admin_login", nullable = false)
    @Schema(description="로그인 아이디", example="admin_user", requiredMode=RequiredMode.REQUIRED)
    private String loginId;

    @Column(name = "company_admin_name", nullable = false)
    @Schema(description="관리자 이름", example="홍길동", requiredMode=RequiredMode.REQUIRED)
    private String name;

    @Column(name = "company_admin_email", nullable = false, unique = true)
    @Schema(description="관리자 이메일 주소", example="admin@example.com", requiredMode=Schema.RequiredMode.REQUIRED)
    private String email;

    @Column(name = "company_admin_password", nullable = false)
    @Schema(description="비밀번호(해시된 값)", accessMode=AccessMode.WRITE_ONLY)
    private String password;

    @Column(name = "company_admin_created_at", nullable = false)
    @Schema(description="계정 생성일시", accessMode=AccessMode.READ_ONLY)
    private LocalDateTime createdAt;

    @Column(name = "company_admin_updated_at", nullable = false)
    @Schema(description="계정 정보 수정일시", accessMode=AccessMode.READ_ONLY)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getCompanyAdminId() {
        return companyAdminId;
    }

    public void setCompanyAdminId(Long companyAdminId) {
        this.companyAdminId = companyAdminId;
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public String getLoginId() {
        return loginId;
    }

    public void setLoginId(String loginId) {
        this.loginId = loginId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

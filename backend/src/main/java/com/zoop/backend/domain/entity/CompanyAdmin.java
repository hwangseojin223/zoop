package com.zoop.backend.domain.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "company_admins")
public class CompanyAdmin {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "company_admins_seq_gen")
    @SequenceGenerator(name = "company_admins_seq_gen", sequenceName = "company_admins_seq", allocationSize = 1)
    private Long companyAdminId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(name = "company_admin_login", nullable = false)
    private String loginId;

    @Column(name = "company_admin_name", nullable = false)
    private String name;

    @Column(name = "company_admin_email", nullable = false, unique = true)
    private String email;

    @Column(name = "company_admin_password", nullable = false)
    private String password;

    @Column(name = "company_admin_created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "company_admin_updated_at", nullable = false)
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

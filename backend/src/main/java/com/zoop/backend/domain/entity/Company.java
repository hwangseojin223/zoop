package com.zoop.backend.domain.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "companies")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "companies_seq_gen")
    @SequenceGenerator(name = "companies_seq_gen", sequenceName = "companies_seq", allocationSize = 1)
    private Long companyId;

    @Column(name = "business_number", nullable = false, unique = true)
    private String businessNumber;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Lob
    @Column(name = "company_address")
    private String companyAddress;

    @Column(name = "company_created_at", nullable = false)
    private LocalDateTime companyCreatedAt;

    @Column(name = "company_updated_at", nullable = false)
    private LocalDateTime companyUpdatedAt;

    @Column(name = "ceo_name")
    private String ceoName;

    @PrePersist
    public void prePersist() {
        companyCreatedAt = companyUpdatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        companyUpdatedAt = LocalDateTime.now();
    }

    public Company() {
        // 기본 생성자 (Jackson 역직렬화용)
    }

    public Long getCompanyId() {
        return companyId;
    }

    public void setCompanyId(Long companyId) {
        this.companyId = companyId;
    }

    public String getBusinessNumber() {
        return businessNumber;
    }

    public void setBusinessNumber(String businessNumber) {
        this.businessNumber = businessNumber;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getCompanyAddress() {
        return companyAddress;
    }

    public void setCompanyAddress(String companyAddress) {
        this.companyAddress = companyAddress;
    }

    public LocalDateTime getCompanyCreatedAt() {
        return companyCreatedAt;
    }

    public void setCompanyCreatedAt(LocalDateTime companyCreatedAt) {
        this.companyCreatedAt = companyCreatedAt;
    }

    public LocalDateTime getCompanyUpdatedAt() {
        return companyUpdatedAt;
    }

    public void setCompanyUpdatedAt(LocalDateTime companyUpdatedAt) {
        this.companyUpdatedAt = companyUpdatedAt;
    }

    public String getCeoName() {
        return ceoName;
    }

    public void setCeoName(String ceoName) {
        this.ceoName = ceoName;
    }
}

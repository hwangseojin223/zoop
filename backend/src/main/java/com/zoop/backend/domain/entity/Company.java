package com.zoop.backend.domain.entity;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;

@Entity
@Table(name = "companies")
@Schema(description="회사 정보를 나타내는 엔티티")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "companies_seq_gen")
    @SequenceGenerator(name = "companies_seq_gen", sequenceName = "companies_seq", allocationSize = 1)
    @Schema(description="회사 고유 ID", example="1", accessMode=Schema.AccessMode.READ_ONLY)
    private Long companyId;

    @Column(name = "business_number", nullable = false, unique = true)
    @Schema(description="사업자 등록 번호", example="123-45-67890", requiredMode=Schema.RequiredMode.REQUIRED)
    private String businessNumber;

    @Column(name = "company_name", nullable = false)
    @Schema(description="회사 이름", example="zoop", requiredMode=Schema.RequiredMode.REQUIRED)
    private String companyName;

    @Lob
    @Column(name = "company_address")
    @Schema(description="회사 주소", example="서울특별시 송파구")
    private String companyAddress;

    @Column(name = "company_created_at", nullable = false)
    @Schema(description="회사 정보 생성일시", accessMode=Schema.AccessMode.READ_ONLY)
    private LocalDateTime companyCreatedAt;

    @Column(name = "company_updated_at", nullable = false)
    @Schema(description="회사 정보 수정일시", accessMode=Schema.AccessMode.READ_ONLY)
    private LocalDateTime companyUpdatedAt;

    @Column(name = "ceo_name")
    @Schema(description="대표자 이름", example="홍길동")
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

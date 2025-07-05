package com.zoop.backend.domain.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "post")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Post {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "post_seq")
    @SequenceGenerator(name = "post_seq", sequenceName = "post_id_seq", allocationSize = 1)
    @Column(name = "post_id")
    private Long postId;
    
    // 기본 필드로 companyId 유지
    @Column(name = "company_id")
    private Long companyId;
    
    // 관계 매핑에 insertable=false, updatable=false 추가
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", insertable = false, updatable = false)
    private Company company;
    
    @Column(name = "company_admin_id")
    private Long companyAdminId;
    
    @Column(name = "post_title")
    private String postTitle;
    
    @Column(name = "post_description")
    @Lob
    private String postDescription;
    
    @Column(name = "post_programming_language")
    private String postProgrammingLanguage;
    
    @Column(name = "post_location")
    private String postLocation;
    
    @Column(name = "post_headcount")
    private Integer postHeadcount;
    
    @Column(name = "post_salary_start")
    private String postSalaryStart;
    
    @Column(name = "post_salary_end")
    private String postSalaryEnd;
    
    @Column(name = "post_posted_date")
    private LocalDate postPostedDate;
    
    @Column(name = "post_expiry_date")
    private LocalDate postExpiryDate;
    
    @Column(name = "post_status")
    private String postStatus;
    
    @Column(name = "post_created_at")
    private LocalDateTime postCreatedAt;
    
    @Column(name = "post_updated_at")
    private LocalDateTime postUpdatedAt;
<<<<<<< HEAD

    @Lob
    @Column(name = "post_ideal_candidate")
    private String postIdealCandidate;

    @PrePersist
    public void onCreate() {
        postCreatedAt = postUpdatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        postUpdatedAt = LocalDateTime.now();
    }
=======
    
    // 필요한 경우 추가 필드 및 관계 매핑
>>>>>>> feat/90/personal-dashboard
}

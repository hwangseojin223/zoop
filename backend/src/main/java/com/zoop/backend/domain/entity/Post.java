package com.zoop.backend.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "post")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "post_seq_gen")
    @SequenceGenerator(name = "post_seq_gen", sequenceName = "post_seq", allocationSize = 1)
    @Column(name = "post_id")
    private Long postId;

    private Long companyId;           // FK (선택적 구현)
    private Long companyAdminId;      // FK (선택적 구현)

    private String postTitle;
    
    @Lob
    private String postDescription;

    private String postProgrammingLanguage;
    private String postLocation;
    private Integer postHeadcount;

    private String postSalaryStart;
    private String postSalaryEnd;

    private LocalDate postPostedDate;
    private LocalDate postExpiryDate;

    private String postStatus;

    private LocalDateTime postCreatedAt;
    private LocalDateTime postUpdatedAt;

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
}

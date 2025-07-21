package com.zoop.backend.domain.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "email_contents")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailContents {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "email_contents_seq")
    @SequenceGenerator(
        name = "email_contents_seq",
        sequenceName = "email_contents_seq",
        allocationSize = 1
    )
    @Column(name = "email_id")
    private Long emailId;

    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Column(name = "email_subject", nullable = false, length = 255)
    private String emailSubject;

    @Lob
    @Column(name = "email_content", nullable = false)
    private String emailContent;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Post와의 관계 매핑 (다대일)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", insertable = false, updatable = false)
    private Post post;
} 
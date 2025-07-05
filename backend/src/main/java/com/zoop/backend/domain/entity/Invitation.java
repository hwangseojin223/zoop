package com.zoop.backend.domain.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "invitations", uniqueConstraints = {
    // @UniqueConstraint(columnNames = {"post_id", "github_login"}),
    @UniqueConstraint(columnNames = {"invitation_unique_token"})
    // @UniqueConstraint(columnNames = {"candidate_id"})
})
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invitation {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "invitation_seq")
    @SequenceGenerator(
        name = "invitation_seq",
        sequenceName = "INVITATION_SEQ",  // DB에 이 이름의 시퀀스가 있어야 함
        allocationSize = 1
    )
    @Column(name = "invitation_id")
    private Long invitationId;

//--------------------------------------------------------------------

    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Column(name = "github_login", nullable = false)
    private String githubLogin;

    @Column(name = "company_admin_id", nullable = false)
    private Long companyAdminId;

    @Column(name = "invitation_unique_token", nullable = false, unique = true)
    private String invitationUniqueToken;

    @Column(name = "invitation_sent_date", nullable = false)
    private LocalDateTime invitationSentDate;

    @Column(name = "invitation_clicked_date")
    private LocalDateTime invitationClickedDate;

    @Column(name = "candidate_id", unique = true)
    private Long candidateId;

    @Column(name = "invitation_status", nullable = false)
    private String invitationStatus;

    // 직접 입력할 필요 없이 save() 메서드가 실행될 때 자동으로 채워짐.
    @CreationTimestamp
    @Column(name = "invitation_created_at", nullable = false, updatable = false)
    private LocalDateTime invitationCreatedAt;
}

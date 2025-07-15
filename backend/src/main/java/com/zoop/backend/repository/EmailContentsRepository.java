package com.zoop.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.zoop.backend.domain.entity.EmailContents;

@Repository
public interface EmailContentsRepository extends JpaRepository<EmailContents, Long> {

    // invitation_id로 이메일 내용 조회 (1:1 관계)
    Optional<EmailContents> findByInvitationId(Long invitationId);

    // invitation_id로 이메일 내용 삭제 (초대 삭제 시 함께 삭제)
    @Modifying
    @Query("DELETE FROM EmailContents e WHERE e.invitationId = :invitationId")
    void deleteByInvitationId(Long invitationId);

    // invitation_id 존재 여부 확인
    boolean existsByInvitationId(Long invitationId);
} 
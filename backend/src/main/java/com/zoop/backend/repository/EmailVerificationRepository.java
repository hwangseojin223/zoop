package com.zoop.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zoop.backend.domain.entity.EmailVerification;

import java.util.Optional;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {
    Optional<EmailVerification> findTopByEmailOrderByCreatedAtDesc(String email);
    void deleteByCreatedAtBefore(java.time.LocalDateTime time);
}

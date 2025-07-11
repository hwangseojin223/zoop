package com.zoop.backend.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.zoop.backend.domain.entity.Candidate;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    Optional<Candidate> findByGithubLogin(String githubLogin);
    Optional<Candidate> findByCandidateEmail(String candidateEmail);
    Optional<Candidate> findByGoogleId(String googleId);
    boolean existsByGithubLogin(String githubLogin);
    Optional<Candidate> findByCandidateNameAndCandidateEmail(String name, String email);
    Optional<Candidate> findByGithubLoginAndCandidateEmailAndCandidateNameAndCandidatePhoneNumber(
        String githubLogin,
        String candidateEmail,
        String candidateName,
        String candidatePhoneNumber
    );
    @Modifying
    @Transactional
    @Query("UPDATE Candidate c SET c.candidateUpdatedAt = :updatedAt WHERE c.candidateId = :candidateId")
    void updateCandidateUpdatedAt(@Param("candidateId") Long candidateId, @Param("updatedAt") LocalDateTime updatedAt);
}

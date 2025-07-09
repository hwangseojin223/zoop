package com.zoop.backend.repository;

import java.time.LocalDateTime;
import java.util.Optional; // entity 패키지 임포트

import org.springframework.data.jpa.repository.JpaRepository; // Spring Data JPA의 JpaRepository 임포트
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.zoop.backend.domain.entity.Candidate; // Optional 클래스 임포트

 // JpaRepository<다룰 엔티티 타입, 해당 엔티티의 Primary Key 타입>를 상속받습니다.
public interface CandidateRepository extends JpaRepository<Candidate, Long> {
     // Spring Data JPA 쿼리 메소드 선언
     // 개인 후보자 로그인 시 사용될 조회 메소드 선언 (GitHub 로그인 ID 또는 이메일로 조회)
    Optional<Candidate> findByGithubLogin(String githubLogin); // githubLogin 필드로 조회
    Optional<Candidate> findByCandidateEmail(String candidateEmail); // candidateEmail 필드로 조회
    Optional<Candidate> findByGoogleId(String googleId);

    // ✅ 회원가입시 아이디 중복 확인용 메서드 추가 --> 지훈
    boolean existsByGithubLogin(String githubLogin);

    /** 합친 후 */
    Optional<Candidate> findByCandidateNameAndCandidateEmail(String name, String email);

    Optional<Candidate> findByGithubLoginAndCandidateEmailAndCandidateNameAndCandidatePhoneNumber(
        String githubLogin,
        String candidateEmail,
        String candidateName,
        String candidatePhoneNumber
    );

    // ✅ candidate_updated_at 업데이트 메서드
    @Modifying
    @Transactional
    @Query("UPDATE Candidate c SET c.candidateUpdatedAt = :updatedAt WHERE c.candidateId = :candidateId")
    void updateCandidateUpdatedAt(@Param("candidateId") Long candidateId, @Param("updatedAt") LocalDateTime updatedAt);

}


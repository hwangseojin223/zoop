package com.zoop.backend.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.zoop.backend.domain.entity.InterviewQuestion;

@Repository
public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, Long> {

    /**
     * 특정 공고와 후보자의 질문 조회
     */
    @Query("SELECT iq FROM InterviewQuestion iq WHERE iq.postId = :postId AND iq.jobCandidateId = :jobCandidateId")
    Optional<InterviewQuestion> findQuestionByPostAndCandidate(@Param("postId") Long postId, @Param("jobCandidateId") Long jobCandidateId);

    /**
     * 기존 질문 내용 수정
     */
    @Modifying
    @Transactional
    @Query("UPDATE InterviewQuestion iq SET iq.questionsJson = :questionsJson, iq.contentHash = :contentHash, iq.updatedAt = CURRENT_TIMESTAMP WHERE iq.postId = :postId AND iq.jobCandidateId = :jobCandidateId")
    int updateQuestions(@Param("postId") Long postId, @Param("jobCandidateId") Long jobCandidateId, @Param("questionsJson") String questionsJson, @Param("contentHash") String contentHash);

    /**
     * 면접 마감시간이 지난 질문들을 자동 삭제
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM InterviewQuestion iq WHERE iq.interviewDeadline < :now")
    int deleteExpiredQuestions(@Param("now") LocalDateTime now);

    /**
     * postId와 jobCandidateId 조합으로 질문 존재 여부 확인
     */
    boolean existsByPostIdAndJobCandidateId(Long postId, Long jobCandidateId);
} 
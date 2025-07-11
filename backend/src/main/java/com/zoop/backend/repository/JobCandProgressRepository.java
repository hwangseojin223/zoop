package com.zoop.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.zoop.backend.domain.dto.ResponderDto;
import com.zoop.backend.domain.entity.JobCandProgress;

import jakarta.transaction.Transactional;

@Repository
public interface JobCandProgressRepository extends JpaRepository<JobCandProgress, Long> {

    // postId와 githubLogin으로 중복 확인
    boolean existsByPostPostIdAndGithubLogin(Long postId, String githubLogin);

    @Query(value = """
        SELECT 
            c.candidate_email AS email,
            c.candidate_name AS name,
            p.post_location AS location,
            p.post_programming_language AS languages,
            ar.analysis_score AS score,
            TO_CHAR(ar.analysis_data) AS portfolioAnalysis
        FROM 
            job_cand_progress jcp
        JOIN 
            candidates c ON jcp.candidate_id = c.candidate_id
        JOIN 
            post p ON jcp.post_id = p.post_id
        LEFT JOIN 
            ai_analysis_results ar 
            ON jcp.job_candidate_id = ar.job_candidate_id 
            AND ar.analysis_type = 'portfolio'
        WHERE 
            jcp.job_cand_curr_stage = '2y'
            AND jcp.post_id = :postId
    """, nativeQuery = true)
    List<ResponderDto> findCandidatesAtStage2yByPost(@Param("postId") Long postId);

    @Query(value = """
        SELECT 
            c.candidate_email AS email,
            c.candidate_name AS name,
            p.post_location AS location,
            p.post_programming_language AS languages,
            ar.analysis_score AS score,
            TO_CHAR(ar.analysis_data) AS portfolioAnalysis
        FROM 
            job_cand_progress jcp
        JOIN 
            candidates c ON jcp.candidate_id = c.candidate_id
        JOIN 
            post p ON jcp.post_id = p.post_id
        LEFT JOIN 
            ai_analysis_results ar 
            ON jcp.job_candidate_id = ar.job_candidate_id 
            AND ar.analysis_type = 'portfolio'
        WHERE 
            jcp.job_cand_curr_stage = '3n'
            AND jcp.post_id = :postId
    """, nativeQuery = true)
    List<ResponderDto> findCandidatesAtStage3nByPost(@Param("postId") Long postId);

    // post와 githubLogin으로 JobCandProgress 조회
    Optional<JobCandProgress> findByPost_PostIdAndGithubLogin(Long postId, String githubLogin);

    // postId와 githubLogin 리스트로 JobCandProgress 조회
    @Query("SELECT j FROM JobCandProgress j WHERE j.post.postId = :postId AND j.githubLogin IN :githubLogins")
    List<JobCandProgress> findByPostIdAndGithubLoginIn(@Param("postId") Long postId, @Param("githubLogins") List<String> githubLogins);

    // 필터링 단계별 githubLogin 조회
    @Query("SELECT j.githubLogin FROM JobCandProgress j WHERE j.post.postId = :postId AND j.jobCandCurrStage = '1n'")
    List<String> findGithubLoginsByPostIdAndFilteringStage(@Param("postId") Long postId);

    // 전체 후보자 조회 (모든 단계)
    @Query("SELECT j.githubLogin FROM JobCandProgress j WHERE j.post.postId = :postId")
    List<String> findGithubLoginsByPostId(@Param("postId") Long postId);

    // 미회신자 조회 (1n, 2n)
    @Query("SELECT j.githubLogin FROM JobCandProgress j WHERE j.post.postId = :postId AND j.jobCandCurrStage IN ('1n', '2n')")
    List<String> findGithubLoginsByPostIdAndNoResponseStage(@Param("postId") Long postId);

    // 회신자 조회 (2y)
    @Query("SELECT j.githubLogin FROM JobCandProgress j WHERE j.post.postId = :postId AND j.jobCandCurrStage = '2y'")
    List<String> findGithubLoginsByPostIdAndResponseStage(@Param("postId") Long postId);

    // 면접 예정자 조회 (3n)
    @Query("SELECT j.githubLogin FROM JobCandProgress j WHERE j.post.postId = :postId AND j.jobCandCurrStage = '3n'")
    List<String> findGithubLoginsByPostIdAndInterviewScheduledStage(@Param("postId") Long postId);

    // 면접 완료자 조회 (3y)
    @Query("SELECT j.githubLogin FROM JobCandProgress j WHERE j.post.postId = :postId AND j.jobCandCurrStage = '3y'")
    List<String> findGithubLoginsByPostIdAndInterviewCompletedStage(@Param("postId") Long postId);

    List<JobCandProgress> findByCandidate_CandidateId(Integer candidateId);

    @Query(value = "SELECT * FROM job_cand_progress WHERE post_id = :postId AND candidate_id = :candidateId", nativeQuery = true)
    Optional<JobCandProgress> findByPost_PostIdAndCandidate_CandidateId(
        @Param("postId") Long postId, 
        @Param("candidateId") Long candidateId
    );

    Optional<JobCandProgress> findByJobCandidateId(Long jobCandidateId);

<<<<<<< HEAD
    // postId로 JobCandProgress 조회 (모든 지원자)
    List<JobCandProgress> findByPost_PostId(Long postId);

    // 직접 지원한 후보자들 조회 (githubLogin이 null인 경우)
    List<JobCandProgress> findByPost_PostIdAndGithubLoginIsNull(Long postId);
    
    // postId와 stage로 JobCandProgress 조회 (직접 지원자 - stage "0")
    List<JobCandProgress> findByPost_PostIdAndJobCandCurrStage(Long postId, String stage);

    // stage로 JobCandProgress 조회 (모든 공고의 특정 stage 지원자)
    List<JobCandProgress> findByJobCandCurrStage(String stage);

    // postId와 candidateId로 JobCandProgress 조회
    Optional<JobCandProgress> findByPost_PostIdAndCandidate_CandidateId(Long postId, Long candidateId);
=======
    // 이메일 전송시 jobCandCurrStage를 2n으로 업데이트
    @Transactional
    @Modifying
    @Query("UPDATE JobCandProgress j SET j.jobCandCurrStage = :stage WHERE j.post.postId = :postId AND j.githubLogin = :githubLogin")
    int updateStageByPostIdAndGithubLogin(@Param("postId") Long postId, @Param("githubLogin") String githubLogin, @Param("stage") String stage);

    // invitation token으로 job_cand_progress의 candidate_id 업데이트
    @Transactional
    @Modifying
    @Query("UPDATE JobCandProgress j SET j.candidate.candidateId = :candidateId WHERE j.post.postId = :postId AND j.githubLogin = :githubLogin")
    int updateCandidateIdByPostIdAndGithubLogin(@Param("postId") Long postId, @Param("githubLogin") String githubLogin, @Param("candidateId") Long candidateId);

    // 추가된 메서드
    List<JobCandProgress> findByPost_PostIdAndJobCandCurrStage(Long postId, String stage);
    List<JobCandProgress> findByPost_PostId(Long postId);
    Optional<JobCandProgress> findByAiIntrvwScheduleId(Long aiIntrvwScheduleId);
    Optional<JobCandProgress> findByGithubLogin(String githubLogin);
>>>>>>> origin/test-experiment-zoop
}

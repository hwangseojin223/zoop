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
            jcp.job_cand_curr_stage = '0'
            AND jcp.post_id = :postId
    """, nativeQuery = true)
    List<ResponderDto> findCandidatesAtStage0ByPost(@Param("postId") Long postId);

    // post와 githubLogin으로 JobCandProgress 조회
    Optional<JobCandProgress> findByPost_PostIdAndGithubLogin(Long postId, String githubLogin);

    // postId와 githubLogin 리스트로 JobCandProgress 조회
    @Query("SELECT j FROM JobCandProgress j WHERE j.post.postId = :postId AND j.githubLogin IN :githubLogins")
    List<JobCandProgress> findByPostIdAndGithubLoginIn(@Param("postId") Long postId, @Param("githubLogins") List<String> githubLogins);

    // postId와 여러 단계로 JobCandProgress 조회 (5n, 5y, 6n, 6y)
    @Query("SELECT j FROM JobCandProgress j WHERE j.post.postId = :postId AND j.jobCandCurrStage IN :stages")
    List<JobCandProgress> findByPost_PostIdAndJobCandCurrStageIn(@Param("postId") Long postId, @Param("stages") List<String> stages);

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

    // 매칭된 후보자 조회 (2y 단계이고 cand_portfolio_id가 있는 경우)
    @Query("SELECT j.githubLogin FROM JobCandProgress j WHERE j.post.postId = :postId AND j.jobCandCurrStage = '2y' AND j.candPortfolioId IS NOT NULL")
    List<String> findGithubLoginsByPostIdAndMatchedStage(@Param("postId") Long postId);

    List<JobCandProgress> findByCandidate_CandidateId(Integer candidateId);

    Optional<JobCandProgress> findByJobCandidateId(Long jobCandidateId);

    // postId로 JobCandProgress 조회 (모든 지원자)
    List<JobCandProgress> findByPost_PostId(Long postId);

    // 직접 지원한 후보자들 조회 (githubLogin이 null인 경우) - 내 버전 기능
    List<JobCandProgress> findByPost_PostIdAndGithubLoginIsNull(Long postId);
    
    // postId와 stage로 JobCandProgress 조회 (직접 지원자 - stage "0")
    List<JobCandProgress> findByPost_PostIdAndJobCandCurrStage(Long postId, String stage);
    
    // cand_portfolio_id와 post_id로 JobCandProgress 조회
    Optional<JobCandProgress> findByCandPortfolioIdAndPost_PostId(Long candPortfolioId, Long postId);

    // cand_portfolio_id로 JobCandProgress 조회
    List<JobCandProgress> findByCandPortfolioId(Long candPortfolioId);

    // stage로 JobCandProgress 조회 (모든 공고의 특정 stage 지원자) - 내 버전 기능
    List<JobCandProgress> findByJobCandCurrStage(String stage);

    // postId와 candidateId로 JobCandProgress 조회
    Optional<JobCandProgress> findByPost_PostIdAndCandidate_CandidateId(Long postId, Long candidateId);

    // 이메일 전송시 jobCandCurrStage를 2n으로 업데이트 - 팀 버전 기능
    @Transactional
    @Modifying
    @Query("UPDATE JobCandProgress j SET j.jobCandCurrStage = :stage WHERE j.post.postId = :postId AND j.githubLogin = :githubLogin")
    int updateStageByPostIdAndGithubLogin(@Param("postId") Long postId, @Param("githubLogin") String githubLogin, @Param("stage") String stage);

    // invitation token으로 job_cand_progress의 candidate_id 업데이트 - 팀 버전 기능
    @Transactional
    @Modifying
    @Query("UPDATE JobCandProgress j SET j.candidate.candidateId = :candidateId WHERE j.post.postId = :postId AND j.githubLogin = :githubLogin")
    int updateCandidateIdByPostIdAndGithubLogin(@Param("postId") Long postId, @Param("githubLogin") String githubLogin, @Param("candidateId") Long candidateId);

    // AI 면접 관련 조회 - 팀 버전 기능
    Optional<JobCandProgress> findByAiIntrvwScheduleId(Long aiIntrvwScheduleId);
    
    // githubLogin으로 조회 - 팀 버전 기능
    Optional<JobCandProgress> findByGithubLogin(String githubLogin);
    
    // githubLogin으로 모든 레코드 조회 (여러 레코드가 있을 수 있음)
    List<JobCandProgress> findAllByGithubLogin(String githubLogin);

    // postId, stage, candPortfolioId IS NOT NULL로 조회
    List<JobCandProgress> findByPost_PostIdAndJobCandCurrStageAndCandPortfolioIdIsNotNull(Long postId, String jobCandCurrStage);
}

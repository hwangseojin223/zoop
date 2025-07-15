package com.zoop.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.zoop.backend.domain.dto.GithubSearchResultWithStageDto;
import com.zoop.backend.domain.entity.GithubSearchResult;

@Repository
public interface GithubSearchResultRepository extends JpaRepository<GithubSearchResult, Long> {

    @Query("SELECT g FROM GithubSearchResult g WHERE g.postId = :postId " +
           "ORDER BY " +
           "CASE WHEN g.candidateEmail IS NOT NULL THEN 0 ELSE 1 END, " +  // 이메일 있는 사람 먼저
           "g.analysisScore DESC NULLS LAST")                              // 점수 높은 순
    List<GithubSearchResult> findSortedByEmailPresenceAndScore(@Param("postId") Long postId);

    @Query("SELECT g FROM GithubSearchResult g WHERE g.postId = :postId AND g.githubLogin IN :githubLogins")
    List<GithubSearchResult> findByPostIdAndGithubLoginIn(@Param("postId") Long postId, @Param("githubLogins") List<String> githubLogins);

    @Query("SELECT g FROM GithubSearchResult g WHERE g.githubLogin = :githubLogin ORDER BY g.githubSearchDate DESC")
    List<GithubSearchResult> findByGithubLogin(@Param("githubLogin") String githubLogin);

    // postId와 githubLogin으로 단일 후보자 조회
    @Query("SELECT g FROM GithubSearchResult g WHERE g.postId = :postId AND g.githubLogin = :githubLogin")
    java.util.Optional<GithubSearchResult> findByPostIdAndGithubLogin(@Param("postId") Long postId, @Param("githubLogin") String githubLogin);

    // 공고 후보자, 지원자 상태조회 20250626
    @Query("""
        SELECT new com.zoop.backend.domain.dto.GithubSearchResultWithStageDto(
            g.githubLogin,
            g.candidateEmail,
            g.githubProfileUrl,
            g.analysisScore,
            a.analysisScore,
            a.analysisData,
            j.jobCandCurrStage,
            p.companyAdminId,
            j.jobCandidateId  
        )
        FROM GithubSearchResult g
        LEFT JOIN AiAnalysisResults a ON g.aiGithubAnalysisId = a.analysisId
        LEFT JOIN JobCandProgress j ON g.postId = j.post.postId AND g.githubLogin = j.githubLogin
        JOIN Post p ON g.postId = p.postId
        WHERE g.postId = :postId
        AND g.candidateEmail != 'not_found@example.com'
    """)
    List<GithubSearchResultWithStageDto> findSearchResultsWithStageByPostId(@Param("postId") Long postId);
}

package com.zoop.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.zoop.backend.domain.entity.AiAnalysisResult;

@Repository
public interface AiAnalysisResultRepository extends JpaRepository<AiAnalysisResult, Long> {

    @Query("SELECT a FROM AiAnalysisResult a WHERE a.githubSearchResultId = :githubSearchResultId")
    Optional<AiAnalysisResult> findByGithubSearchResultId(@Param("githubSearchResultId") Long githubSearchResultId);

    @Query("SELECT a FROM AiAnalysisResult a WHERE a.analysisType = :analysisType")
    List<AiAnalysisResult> findByAnalysisType(@Param("analysisType") String analysisType);

    @Query("SELECT a FROM AiAnalysisResult a WHERE a.githubSearchResultId IN " +
           "(SELECT g.githubSearchResultId FROM GithubSearchResult g WHERE g.postId = :postId)")
    List<AiAnalysisResult> findByPostId(@Param("postId") Long postId);

    @Query("SELECT a FROM AiAnalysisResult a WHERE a.githubSearchResultId IN :ids")
    List<AiAnalysisResult> findByGithubSearchResultIds(@Param("ids") List<Long> ids);

    @Query("SELECT a FROM AiAnalysisResult a WHERE a.jobCandidateId = :jobCandidateId AND a.analysisType = :analysisType")
    List<AiAnalysisResult> findByJobCandidateIdAndAnalysisType(@Param("jobCandidateId") Long jobCandidateId, @Param("analysisType") String analysisType);
} 
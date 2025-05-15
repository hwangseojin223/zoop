package com.zoop.backend.repository;

import com.zoop.backend.domain.entity.GithubSearchResult;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GithubSearchResultRepository extends JpaRepository<GithubSearchResult, Long> {

    @Query("SELECT g FROM GithubSearchResult g WHERE g.postId = :postId " +
           "ORDER BY " +
           "CASE WHEN g.candidateEmail IS NOT NULL THEN 0 ELSE 1 END, " +  // 이메일 있는 사람 먼저
           "g.analysisScore DESC NULLS LAST")                              // 점수 높은 순
    List<GithubSearchResult> findSortedByEmailPresenceAndScore(@Param("postId") Long postId);
}

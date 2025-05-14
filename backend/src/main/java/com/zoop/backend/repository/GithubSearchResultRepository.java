package com.zoop.backend.repository;

import com.zoop.backend.domain.entity.GithubSearchResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GithubSearchResultRepository extends JpaRepository<GithubSearchResult, Long> {
}

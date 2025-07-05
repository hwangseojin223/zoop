package com.zoop.backend.repository;


import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.zoop.backend.domain.entity.Portfolio;

import org.springframework.data.repository.CrudRepository;

public interface PortfolioRepository extends CrudRepository<Portfolio, Long> {

    @Query("SELECT p.portfolioFilePath FROM Portfolio p WHERE p.jobCandidateId = :jobCandId")
    String findFilePathByJobCandidateId(@Param("jobCandId") Long jobCandidateId);

    /**합친 이후 */
    Optional<Portfolio> findByJobCandidateId(Long jobCandidateId);
}

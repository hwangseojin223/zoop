package com.zoop.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.zoop.backend.domain.dto.ResponderDto;
import com.zoop.backend.domain.entity.JobCandProgress;

@Repository
public interface JobCandProgressRepository extends JpaRepository<JobCandProgress, Long> {

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
}

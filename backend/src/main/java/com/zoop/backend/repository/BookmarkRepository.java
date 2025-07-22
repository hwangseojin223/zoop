package com.zoop.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zoop.backend.domain.entity.Bookmark;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    List<Bookmark> findByCandidate_CandidateId(Long candidateId);
    Optional<Bookmark> findByCandidate_CandidateIdAndPost_PostId(Long candidateId, Long postId);
    void deleteByCandidate_CandidateIdAndPost_PostId(Long candidateId, Long postId);
} 
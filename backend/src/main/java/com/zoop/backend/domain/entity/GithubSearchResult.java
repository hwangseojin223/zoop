package com.zoop.backend.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "github_search_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GithubSearchResult {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "gsr_seq_gen")
    @SequenceGenerator(name = "gsr_seq_gen", sequenceName = "GITHUB_SEARCH_RESULT_SEQ", allocationSize = 1)
    @Column(name = "github_search_result_id")
    private Long githubSearchResultId;

    private Long postId;

    private String githubLogin;

    private String githubProfileUrl;

    private LocalDateTime githubSearchDate;

    private LocalDateTime githubCreatedAt;

    // Optional: 추후 AI 분석 결과 연결
    private Long aiGithubAnalysisId;
}

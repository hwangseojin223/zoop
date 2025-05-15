package com.zoop.backend.domain.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GithubCandidateDto {
    private String login;
    private String profileUrl;
    private String email;
    private Double score; // ✅ 추가
}


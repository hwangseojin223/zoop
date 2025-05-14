package com.zoop.backend.domain.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GithubCandidateDto {
    private String login;
    private String profile_url;
    private String email;
}

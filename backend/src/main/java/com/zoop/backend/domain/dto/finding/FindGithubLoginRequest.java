package com.zoop.backend.domain.dto.finding;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FindGithubLoginRequest {
    private String name;
    private String email;
}

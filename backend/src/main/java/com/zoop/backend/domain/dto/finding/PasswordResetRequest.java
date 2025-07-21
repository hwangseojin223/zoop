package com.zoop.backend.domain.dto.finding;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PasswordResetRequest {
    private String githubLogin;
    private String email;
    private String candidateName;
    private String candidatePhoneNumber;
}
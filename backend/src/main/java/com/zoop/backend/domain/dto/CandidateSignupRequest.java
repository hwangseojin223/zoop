package com.zoop.backend.domain.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class CandidateSignupRequest {

    // Candidate 저장을 위한 항목들
    private Long candidateId; // Oracle NUMBER(10) 타입에 대응
    private String githubLogin;
    private String candidateEmail;
    private String candidatePassword;
    private String candidateName;
    private String candidatePhoneNumber;
    private LocalDateTime candidateRegistrationDate; // 데이터베이스 DATE 타입에 대응합니다. java.util.Date 또는 java.sql.Date 사용
    private LocalDateTime candidateCreatedAt;
    private LocalDateTime candidateUpdatedAt;
    private String googleId;

    // invitation을 위한 항목들
    private String invitationToken; // ✅ 초대 토큰 포함

}

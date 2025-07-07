package com.zoop.backend.domain.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApplicationRequestDto {
    private Long postId;
    private String postTitle;
    
    // 지원자 정보
    private String name;
    private String email;
    private String phone;
    private String githubLogin;
    private String languages;
    private String experience;
    private String portfolio;
    private String message;
} 
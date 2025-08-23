package com.zoop.backend.domain.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class InvitationSendRequest {
    private Long postId;            
    private String githubLogin;     
    private Long companyAdminId;    
    private String candidateEmail;  
    private String customEmailSubject;
    private String customEmailContent;
}

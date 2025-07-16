package com.zoop.backend.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor // ✅ Jackson 역직렬화를 위해 꼭 필요
@AllArgsConstructor // ✅ 필요시 추가
public class InvitationSendRequest {
    private Long postId;            // 공고 ID
    private String githubLogin;     // GitHub 사용자명
    private Long companyAdminId;    // 초대한 관리자 ID
    private String candidateEmail;  // ✅ 추가
    
    // 커스텀 이메일 기능 (optional - 있으면 커스텀, 없으면 기본 템플릿)
    private String customEmailSubject;           // 커스텀 이메일 제목 (optional)
    private String customEmailContent;           // 커스텀 이메일 내용 (optional)
}

/**
 * 기업회원이 github_search 이후 필터링된 리스트에서
 * 메일 보내기 버튼을 눌렀을 때 가져갈 정보들.
 */

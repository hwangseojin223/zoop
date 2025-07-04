package com.zoop.backend.domain.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InvitationSendRequest {
    private Long postId;            // 공고 ID
    private String githubLogin;     // GitHub 사용자명
    private Long companyAdminId;    // 초대한 관리자 ID
    private String candidateEmail; // ✅ 추가
}

/**
 * 기업회원이 github_search 이후 필터링된 리스트에서
 * 메일 보내기 버튼을 눌렀을 때 가져갈 정보들.
 */

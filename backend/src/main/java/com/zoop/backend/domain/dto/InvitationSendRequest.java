package com.zoop.backend.domain.dto;

<<<<<<< HEAD
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor // ✅ Jackson 역직렬화를 위해 꼭 필요
@AllArgsConstructor // ✅ 필요시 추가
=======
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
>>>>>>> feat/93/interview-ai
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

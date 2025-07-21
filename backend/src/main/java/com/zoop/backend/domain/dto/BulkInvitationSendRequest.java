package com.zoop.backend.domain.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkInvitationSendRequest {
    
    @NotNull(message = "공고 ID는 필수입니다")
    private Long postId;                        // 공고 ID
    
    @NotNull(message = "관리자 ID는 필수입니다")
    private Long companyAdminId;                // 초대한 관리자 ID
    
    // 선택된 후보자들 목록
    @NotEmpty(message = "최소 1명 이상의 후보자를 선택해야 합니다")
    @Valid  // 리스트 내 객체들도 유효성 검사
    private List<CandidateInfo> candidates;
    
    // 커스텀 이메일 내용 (모달에서 수정된 내용)
    @NotBlank(message = "이메일 제목은 필수입니다")
    private String customEmailSubject;          // 수정된 이메일 제목
    
    @NotBlank(message = "이메일 내용은 필수입니다")
    private String customEmailContent;          // 수정된 이메일 내용
}

/**
 * 일괄전송 요청 DTO
 * 
 * 사용 플로우:
 * 1. Frontend에서 여러 후보자 선택
 * 2. "메일보내기" 버튼 클릭
 * 3. 모달에서 기본 템플릿 수정
 * 4. 이 DTO로 일괄전송 요청
 * 
 * 예시:
 * {
 *   "postId": 123,
 *   "companyAdminId": 456,
 *   "candidates": [
 *     {"githubLogin": "john_doe", "candidateEmail": "john@example.com"},
 *     {"githubLogin": "jane_smith", "candidateEmail": "jane@example.com"}
 *   ],
 *   "customEmailSubject": "[ZOOP] 백엔드 개발자 - 인터뷰 초대",
 *   "customEmailContent": "<div>안녕하세요...</div>"
 * }
 */ 
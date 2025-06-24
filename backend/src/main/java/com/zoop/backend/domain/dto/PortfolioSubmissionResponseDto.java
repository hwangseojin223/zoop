package com.zoop.backend.domain.dto;

/**
 *
 * @author hwangseojin
 */

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PortfolioSubmissionResponseDto {
    private Integer portfolioId;
    private String message;
    private boolean success;
    private String redirectUrl; // 필드 추가

    // 기존 getter/setter 유지

    public String getRedirectUrl() {
        return redirectUrl;
    }

    public void setRedirectUrl(String redirectUrl) {
        this.redirectUrl = redirectUrl; // 예외 대신 실제로 값을 설정
    }
}

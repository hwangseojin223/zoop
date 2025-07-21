package com.zoop.backend.domain.dto.modal;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class PortfolioSubmissionDateResponse {
    private LocalDateTime portfolioSubmissionDate;
}

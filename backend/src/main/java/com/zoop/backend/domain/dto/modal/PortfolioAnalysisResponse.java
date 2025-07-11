package com.zoop.backend.domain.dto.modal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PortfolioAnalysisResponse {
    private String analysisData;
    private Double analysisScore;
}

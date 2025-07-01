package com.zoop.backend.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidatePreferencesDto {
    private Long candidateId;
    private String preferredJob;
    private String preferredRegion;
    private String preferredSalary;
    private String preferredCompanySize;
    private String preferredCommuteTime;
    private String preferredBenefit;
} 
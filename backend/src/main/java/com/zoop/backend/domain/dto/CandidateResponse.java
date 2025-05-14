package com.zoop.backend.domain.dto;

import lombok.Data;

import java.util.List;

@Data
public class CandidateResponse {
    private List<CandidateDto> candidates;
}

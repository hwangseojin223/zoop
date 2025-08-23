package com.zoop.backend.domain.dto;

import java.util.List;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class CandidateResponse {
    private List<CandidateDto> candidates;
    
    public List<CandidateDto> getCandidates() {
        return candidates;
    }
    
    public void setCandidates(List<CandidateDto> candidates) {
        this.candidates = candidates;
    }
}

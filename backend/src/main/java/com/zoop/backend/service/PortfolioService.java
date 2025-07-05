package com.zoop.backend.service;

import com.zoop.backend.domain.dto.modal.PortfolioSubmissionDateResponse;
import com.zoop.backend.domain.entity.Portfolio;
import com.zoop.backend.repository.PortfolioRepository;
import lombok.RequiredArgsConstructor;

import java.util.Optional;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PortfolioService {
    private final PortfolioRepository portfolioRepository;

    public String getFilePathByJobCandId(Long jobCandidateId) {
        return portfolioRepository.findFilePathByJobCandidateId(jobCandidateId);
    }

    /**합친 이후 */
    public Optional<PortfolioSubmissionDateResponse> getSubmissionDate(Long jobCandidateId) {
        return portfolioRepository.findByJobCandidateId(jobCandidateId)
                .map(p -> new PortfolioSubmissionDateResponse(p.getPortfolioSubmissionDate()));
    }
}

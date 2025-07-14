package com.zoop.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zoop.backend.domain.entity.Candidate;
import com.zoop.backend.repository.CandidateRepository;

import lombok.Data;

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {
    private final CandidateRepository candidateRepository;

    public CandidateController(CandidateRepository candidateRepository) {
        this.candidateRepository = candidateRepository;
    }

    @GetMapping("/{candidateId}")
    public ResponseEntity<?> getCandidate(@PathVariable Long candidateId) {
        return candidateRepository.findById(candidateId)
            .map(candidate -> ResponseEntity.ok(new CandidateInfoDto(candidate)))
            .orElse(ResponseEntity.notFound().build());
    }

    @Data
    public static class CandidateInfoDto {
        private final String name;
        private final String email;
        private final String phone;
        public CandidateInfoDto(Candidate c) {
            this.name = c.getCandidateName();
            this.email = c.getCandidateEmail();
            this.phone = c.getCandidatePhoneNumber();
        }
    }
}

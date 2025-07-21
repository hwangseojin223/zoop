package com.zoop.backend.client;

import java.util.List;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.zoop.backend.domain.dto.CandidateDto;
import com.zoop.backend.domain.dto.CandidateResponse;
import com.zoop.backend.domain.dto.FilterRequestDto;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class GitHubCandidateClient {

    private final RestTemplate restTemplate = new RestTemplate();

    public List<CandidateDto> getCandidates(FilterRequestDto dto) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<FilterRequestDto> request = new HttpEntity<>(dto, headers);

        ResponseEntity<CandidateResponse> response = restTemplate
                .postForEntity("http://localhost:8001/search", request, CandidateResponse.class);

        return response.getBody() != null ? response.getBody().getCandidates() : List.of();
    }
}
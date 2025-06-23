package com.zoop.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zoop.backend.domain.dto.ResponderDto;
import com.zoop.backend.repository.JobCandProgressRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobCandProgressService {

    private final JobCandProgressRepository jobCandProgressRepository;

    @Transactional(readOnly = true)
    public List<ResponderDto> getCandidatesAtStage3nByPost(Long postId) {
        
        log.info("Repository 메서드 실행 직전");
        List<ResponderDto> list = jobCandProgressRepository.findCandidatesAtStage3nByPost(postId);
        log.info("Repository 메서드 실행 직후: {}", list.size());

        return list != null ? list : List.of(); // 자바 9 이상이면 List.of(), 이하에서는 Collections.emptyList()
    }
}

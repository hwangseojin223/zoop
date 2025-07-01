package com.zoop.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zoop.backend.domain.dto.ResponderDto;
import com.zoop.backend.repository.JobCandProgressRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JobCandProgressService {

    private final JobCandProgressRepository jobCandProgressRepository;

    @Transactional(readOnly = true)
    public List<ResponderDto> getCandidatesAtStage2yByPost(Long postId) {
        System.out.println("2y 스테이지 후보자 조회: " + postId);
        List<ResponderDto> list = jobCandProgressRepository.findCandidatesAtStage2yByPost(postId);
        System.out.println("조회된 후보자 수: " + list.size());
        return list;
    }
}

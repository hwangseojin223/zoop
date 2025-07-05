package com.zoop.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zoop.backend.domain.dto.InvitationSendRequest;
import com.zoop.backend.domain.dto.ResponderDto;
import com.zoop.backend.service.JobCandProgressService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
@Slf4j
@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class JobCandProgressController {

    private final JobCandProgressService jobCandProgressService;

    // @GetMapping
    // public ResponseEntity<List<JobCandProgress>> getAllProgresses() {
    //     return ResponseEntity.ok(jobCandProgressService.getAllProgresses());
    // }

    // URL 예시: /api/post/1
    @GetMapping("{postId}")
    public List<ResponderDto> getCandidatesAtStage3nByPost(@PathVariable Long postId) {
        log.info("Controller: 요청 들어옴, postId=" + postId);
        List<ResponderDto> list = jobCandProgressService.getCandidatesAtStage3nByPost(postId);
        log.info("리스트 크기 : " + list.size());

        return list;
    }

    // 이메일 전송 후 job_cand_curr_stage를 2n으로 업데이트
    @PostMapping("/update-stage-2n")
    public ResponseEntity<?> updateProgressStage(@RequestBody List<InvitationSendRequest> dtos) {
        jobCandProgressService.updateProgressStageBulk(dtos);
        log.info("Controller : 전달받은 데이터: {} ", dtos);
        log.info("Controller: Service로 전달 완료");
        return ResponseEntity.ok("진행 단계가 '2n'으로 업데이트되었습니다.");
    }
}

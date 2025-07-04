package com.zoop.backend.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zoop.backend.domain.dto.InvitationSendRequest;
import com.zoop.backend.domain.entity.Invitation;
import com.zoop.backend.repository.InvitationRepository;
import com.zoop.backend.repository.CandidateRepository;
import com.zoop.backend.service.InvitationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
public class InvitationController {

    private final InvitationService invitationService;
    private final InvitationRepository invitationRepository;
    private final CandidateRepository candidateRepository;

    // 1. 메일보내기
    @PostMapping("/send")
    public ResponseEntity<String> sendInvitation(@RequestBody InvitationSendRequest request) {
        invitationService.sendInvitation(request);
        return ResponseEntity.ok("📨 초대 메일이 성공적으로 전송되었습니다.");
    }

    // 2. 후보자가 링크를 클릭했을 경우 클릭날짜 저장 --> 회원가입/로그인 페이지로 데이터 전달
    @PostMapping("/clicked/{token}")
    public ResponseEntity<?> markInvitationClicked(@PathVariable String token) {
        log.info("받아온 토큰: {}", token);
        Optional<Invitation> optional = invitationRepository.findByInvitationUniqueToken(token);

        if (optional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("초대를 찾을 수 없습니다.");
        }

        Invitation invitation = optional.get();

        // 클릭 날짜 저장
        if (invitation.getInvitationClickedDate() == null) {
            invitation.setInvitationClickedDate(LocalDateTime.now());
            invitationRepository.save(invitation);
        }

        // 가입 여부 확인
        boolean isSignedUp = candidateRepository.findByGithubLogin(invitation.getGithubLogin()).isPresent();

        // 가입 페이지로 전달할 데이터
        Map<String, Object> response = new HashMap<>();
        response.put("githubLogin", invitation.getGithubLogin());
        response.put("token", token);
        response.put("isSignedUp", isSignedUp);
        log.info("가입페이지로 전달한 데이터 : {}", response.get("githubLogin"));
        return ResponseEntity.ok(response);
    }

    // 메일 일괄전송
    @PostMapping("/send-multiple")
    public ResponseEntity<String> sendMultipleInvitations(@RequestBody List<InvitationSendRequest> requests) {
        for (InvitationSendRequest request : requests) {
            invitationService.sendInvitation(request);
        }
        return ResponseEntity.ok("📨 여러 명에게 초대 메일을 전송했습니다.");
    }

}


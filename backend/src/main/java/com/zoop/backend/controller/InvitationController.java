<<<<<<< HEAD
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
import org.springframework.web.bind.annotation.GetMapping;

import com.zoop.backend.domain.dto.InvitationSendRequest;
import com.zoop.backend.domain.dto.modal.InvitationSentDateResponse;
import com.zoop.backend.domain.entity.Invitation;
import com.zoop.backend.domain.entity.Candidate;
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
        log.info("GitHub 로그인: {}, 회원가입 여부: {}", invitation.getGithubLogin(), isSignedUp);

        // 가입 페이지로 전달할 데이터
        Map<String, Object> response = new HashMap<>();
        response.put("githubLogin", invitation.getGithubLogin());
        response.put("token", token);
        response.put("isSignedUp", isSignedUp);
        log.info("가입페이지로 전달한 데이터 : {}", response);
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

    /**합친 이후 */
    @GetMapping("/{postId}/{githubLogin}/sent-times")
    public ResponseEntity<List<InvitationSentDateResponse>> getAllInvitationSentTimes(
            @PathVariable Long postId,
            @PathVariable String githubLogin) {

        List<InvitationSentDateResponse> response = invitationService.getAllInvitationSentDates(postId, githubLogin);
        return ResponseEntity.ok(response);
    }

    // 3. 로그인 성공 후 candidate_id 업데이트
    @PostMapping("/update-candidate-id")
    public ResponseEntity<?> updateCandidateId(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String githubLogin = request.get("githubLogin");
        
        if (token == null || githubLogin == null) {
            return ResponseEntity.badRequest().body("토큰과 GitHub 로그인이 필요합니다.");
        }

        try {
            // 1. 토큰으로 Invitation 조회
            Optional<Invitation> optionalInvitation = invitationRepository.findByInvitationUniqueToken(token);
            if (optionalInvitation.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("유효하지 않은 초대 토큰입니다.");
            }

            Invitation invitation = optionalInvitation.get();

            // 2. GitHub 로그인 일치 확인
            if (!githubLogin.equals(invitation.getGithubLogin())) {
                return ResponseEntity.badRequest().body("GitHub 로그인이 일치하지 않습니다.");
            }

            // 3. Candidate 조회
            Optional<Candidate> optionalCandidate = candidateRepository.findByGithubLogin(githubLogin);
            if (optionalCandidate.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("해당 GitHub 로그인의 회원을 찾을 수 없습니다.");
            }

            Candidate candidate = optionalCandidate.get();

            // 4. candidate_id 업데이트 (이미 업데이트된 경우 스킵)
            if (invitation.getCandidateId() == null) {
                invitation.setCandidateId(candidate.getCandidateId());
                invitationRepository.save(invitation);
                log.info("✅ Invitation candidate_id 업데이트 완료: invitationId={}, candidateId={}, token={}", 
                        invitation.getInvitationId(), candidate.getCandidateId(), token);
                
                return ResponseEntity.ok(Map.of(
                    "message", "candidate_id 업데이트 완료",
                    "invitationId", invitation.getInvitationId(),
                    "candidateId", candidate.getCandidateId()
                ));
            } else {
                log.info("ℹ️ 이미 업데이트된 Invitation: invitationId={}, candidateId={}", 
                        invitation.getInvitationId(), invitation.getCandidateId());
                return ResponseEntity.ok(Map.of(
                    "message", "이미 업데이트된 초대입니다",
                    "invitationId", invitation.getInvitationId(),
                    "candidateId", invitation.getCandidateId()
                ));
            }

        } catch (Exception e) {
            log.error("❌ candidate_id 업데이트 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("업데이트 중 오류가 발생했습니다.");
        }
    }

}

=======
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

>>>>>>> feat/93/interview-ai

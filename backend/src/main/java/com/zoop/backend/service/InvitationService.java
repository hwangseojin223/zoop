package com.zoop.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;

import com.zoop.backend.domain.dto.InvitationSendRequest;
import com.zoop.backend.domain.entity.Invitation;
import com.zoop.backend.domain.entity.Post;
import com.zoop.backend.repository.InvitationRepository;
import com.zoop.backend.repository.PostRepository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final PostRepository postRepository;
    private final EmailService emailService;

    public void sendInvitation(InvitationSendRequest dto) {
        // 1. 고유 토큰 생성
        String token = UUID.randomUUID().toString();

        // 2. Invitation 객체 생성
        Invitation invitation = Invitation.builder()
                .postId(dto.getPostId())
                .githubLogin(dto.getGithubLogin())
                .companyAdminId(dto.getCompanyAdminId())
                .invitationUniqueToken(token)
                .invitationSentDate(LocalDateTime.now())
                .invitationStatus("sent")
                .build();

        // 3. DB 저장
        invitationRepository.save(invitation);
        log.info(invitation.toString());

        // 4. post 조회
        Optional<Post> optionalPost = postRepository.findById(dto.getPostId());
        if (optionalPost.isEmpty()) {
            log.error("❌ postId={}에 해당하는 공고가 없습니다.", dto.getPostId());
            return;
        }
        Post post = optionalPost.get();

        // 5. 메일 전송 (임시 출력)
        try {
            emailService.sendInvitationEmail(
                dto.getCandidateEmail(), // 수정된 부분,
                // "ezenkenneth93@gmail.com",
                dto.getGithubLogin(),
                token, 
                post
            );
        } catch (Exception e) {
            log.error("❌ 메일 발송 실패: {}", e.getMessage(), e);
            // Optional: invitationStatus를 "failed"로 업데이트해도 됨
        }

        log.info("📨 메일 발송: 초대 링크 → https://zoop.kr/invite/" + token);
    }
}

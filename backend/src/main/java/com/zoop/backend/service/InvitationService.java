package com.zoop.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import com.zoop.backend.domain.dto.InvitationSendRequest;
import com.zoop.backend.domain.dto.modal.InvitationSentDateResponse;
import com.zoop.backend.domain.entity.Invitation;
import com.zoop.backend.domain.entity.Post;
import com.zoop.backend.repository.InvitationRepository;
import com.zoop.backend.repository.PostRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvitationService {

    @Value("${zoop.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    private final InvitationRepository invitationRepository;
    private final PostRepository postRepository;
    private final EmailService emailService;
    private final JobCandProgressService jobCandProgressService;

    public void sendInvitation(InvitationSendRequest dto) {
        // 1. 고유 토큰 생성
        String token = UUID.randomUUID().toString();

        // 2. post 조회 (여기서 companyAdminId도 가져옴)
        Optional<Post> optionalPost = postRepository.findById(dto.getPostId());
        if (optionalPost.isEmpty()) {
            log.error("❌ postId={}에 해당하는 공고가 없습니다.", dto.getPostId());
            return;
        }
        Post post = optionalPost.get();

        // 3. Invitation 객체 생성 (companyAdminId를 post에서 가져옴)
        Invitation invitation = Invitation.builder()
                .postId(dto.getPostId())
                .githubLogin(dto.getGithubLogin())
                .companyAdminId(post.getCompanyAdminId())
                .invitationUniqueToken(token)
                .invitationSentDate(LocalDateTime.now())
                .invitationStatus("sent")
                .build();

        // 4. DB 저장
        invitationRepository.save(invitation);
        log.info(invitation.toString());

        // 5. 메일 전송 (임시 출력)
        try {
            emailService.sendInvitationEmail(
                dto.getCandidateEmail(),
                dto.getGithubLogin(),
                token, 
                post
            );
            
            // 6. job_cand_progress 테이블의 stage를 2n으로 업데이트
            jobCandProgressService.updateProgressStageBulk(List.of(dto));
            log.info("✅ job_cand_curr_stage를 2n으로 업데이트 완료: postId={}, githubLogin={}", dto.getPostId(), dto.getGithubLogin());
            
        } catch (Exception e) {
            log.error("❌ 메일 발송 실패: {}", e.getMessage(), e);
            invitationRepository.updateStatusById(invitation.getInvitationId(), "failed");
        }

        log.info("📨 메일 발송: 초대 링크 → " + frontendUrl + "/invite/" + token);
    }

    /**합친 이후 */
    public List<InvitationSentDateResponse> getAllInvitationSentDates(Long postId, String githubLogin) {
        List<Invitation> invitations = invitationRepository.findAllByPostIdAndGithubLoginOrderByInvitationSentDateDesc(postId, githubLogin);
        return invitations.stream()
                .map(inv -> new InvitationSentDateResponse(inv.getInvitationSentDate()))
                .collect(Collectors.toList());
    }
}

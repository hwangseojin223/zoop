package com.zoop.backend.repository;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.zoop.backend.domain.entity.Invitation;

@Repository
public interface InvitationRepository extends JpaRepository<Invitation, Long> {

    // 초대 링크를 클릭했을 때, 해당 token으로 invitation을 조회
    Optional<Invitation> findByInvitationUniqueToken(String token);

    // 회원가입할 때, 해당 GitHub 계정으로 초대된 기록이 있는지 확인
    Optional<Invitation> findByGithubLogin(String githubLogin);

    // 여러 초대 건을 가져올 수 있도록 추가
    List<Invitation> findAllByGithubLogin(String githubLogin);


    // 초대 링크를 클릭한 시각을 기록 / 사용자가 이메일 링크를 클릭할 때 → 백엔드에서 이 쿼리 호출
    @Modifying
    @Query("UPDATE Invitation i SET i.invitationClickedDate = CURRENT_TIMESTAMP WHERE i.invitationUniqueToken = :token")
    void updateClickedDateByToken(String token);

    @Modifying
    @Query("UPDATE Invitation i SET i.candidateId = :candidateId WHERE i.githubLogin = :githubLogin")
    void updateCandidateIdByGithubLogin(String githubLogin, Long candidateId);

    @Modifying
    @Query("UPDATE Invitation i SET i.invitationStatus = :status WHERE i.invitationId = :id")
    void updateStatusById(Long id, String status);
    
    // // 링크를 클릭하고 들어온 회원이 이미 가입 되어있는가?
    // @Query("""
    //     SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END
    //     FROM Candidate c
    //     WHERE c.githubLogin = (
    //         SELECT i.githubLogin FROM Invitation i WHERE i.invitationUniqueToken = :token
    //     )
    // """)
    // boolean isGithubLoginAlreadySignedUp(@Param("token") String token);

}


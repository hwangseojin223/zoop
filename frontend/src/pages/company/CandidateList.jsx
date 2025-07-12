import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import styled, { css, keyframes } from 'styled-components';
import Navbar from '../../components/Navbar';
import { FaGithub, FaExpandAlt, FaTimes, FaStar, FaCode, FaEnvelope, FaEdit } from 'react-icons/fa';

// =========== Styled Components ===========

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(60px) scale(0.98);}
  to   { opacity: 1; transform: translateY(0) scale(1);}
`;

const Wrapper = styled.div`
  font-family: 'SUIT', sans-serif;
  background: #f6f8fa;
  min-height: 100vh;
`;

const Container = styled.div`
  max-width: 1240px;
  margin: 0 auto;
  padding: 7rem 2rem 3rem 2rem;
  position: relative;
`;

const PostInfoCard = styled.div`
  background: #fff;
  border-radius: 28px;
  box-shadow: 0 6px 32px rgba(40,60,90,0.10);
  padding: 2.8rem 2.8rem 2.1rem 2.8rem;
  margin-bottom: 3.5rem;
  border: 1px solid #e9ecef;
  position: relative;
  min-width: 350px;
  animation: ${fadeIn} 0.7s cubic-bezier(.35,.97,.46,1.01);
`;

const EditIcon = styled(FaEdit)`
  position: absolute;
  top: 2.1rem;
  right: 2.2rem;
  font-size: 1.25rem;
  color: #bac2cd;
  cursor: pointer;
  transition: color 0.2s;
  &:hover { color: #30c59b; }
`;

const PostInfoHeader = styled.h1`
  font-size: 2.1rem;
  font-weight: 800;
  color: #262e38;
  margin-bottom: 1.55rem;
  letter-spacing: -1.2px;
  line-height: 1.13;
`;

const PostInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit,minmax(170px,1fr));
  gap: 1.1rem 1.5rem;
  margin-bottom: 1.15rem;
`;

const InfoLabel = styled.span`
  font-size: 1rem;
  color: #a6b1c0;
  font-weight: 700;
`;

const InfoText = styled.span`
  font-size: 1.08rem;
  color: #222;
  font-weight: 500;
  margin-left: 0.4rem;
`;

const PostDesc = styled.div`
  background: #f7f9fb;
  border-radius: 13px;
  padding: 1.08rem 1.4rem;
  color: #49505c;
  font-size: 1rem;
  margin-top: 1rem;
`;

const CandidatesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: end;
  margin-bottom: 1.6rem;
  margin-top: 0.7rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.35rem;
  font-weight: 800;
  color: #263249;
  letter-spacing: -0.6px;
  line-height: 1.15;
`;

const MailButton = styled.button`
  background: #30c59b;
  color: #fff;
  border: none;
  border-radius: 1.6rem;
  padding: 0.7rem 1.8rem;
  font-size: 1.08rem;
  font-weight: 700;
  box-shadow: 0 2px 16px rgba(40,150,110,0.12);
  transition: background 0.15s, transform 0.12s;
  margin-bottom: 1rem;
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  position: absolute;
  top: -55px; right: 0;
  z-index: 11;
  &:hover { background: #279a7e; transform: scale(1.04);}
`;

const PosterScrollWrap = styled.div`
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #ddeeff #fff;
  padding-bottom: 2.5rem;
  &::-webkit-scrollbar { height: 10px; background: #fff;}
  &::-webkit-scrollbar-thumb { background: #e5edf7; border-radius: 8px;}
`;

const PostersRow = styled.div`
  display: flex;
  gap: 2.3rem;
  min-width: 800px;
`;

const CandidateCard = styled.div`
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 26px rgba(20,40,60,0.12);
  width: 320px;
  min-width: 320px;
  padding: 2.6rem 1.4rem 1.8rem 1.4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  border: ${props => props.selected ? '2.6px solid #30c59b' : '1.3px solid #e3e9ef'};
  transition: box-shadow 0.18s, border 0.21s, transform 0.23s;
  position: relative;
  animation: ${fadeIn} 0.6s cubic-bezier(.18,1.12,.33,1.05);
  ${props => props.selected && css`transform: scale(1.045);`}
  &:hover {
    box-shadow: 0 18px 36px rgba(80,180,180,0.15);
    transform: translateY(-9px) scale(1.05);
    z-index: 2;
  }
`;

const Avatar = styled.div`
  width: 88px; height: 88px;
  border-radius: 50%;
  background: linear-gradient(130deg, #37dfa7 0%, #3bb2f8 90%);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 1.22rem;
  box-shadow: 0 2px 10px #e9f9f3;
`;

const Username = styled.div`
  font-weight: 800;
  font-size: 1.18rem;
  margin-bottom: 0.55rem;
  color: #21282f;
  letter-spacing: -0.3px;
`;

const CardMeta = styled.div`
  margin-bottom: 1.1rem;
  text-align: center;
`;

const MetaTag = styled.span`
  display: inline-block;
  background: #e7f5ee;
  color: #13b483;
  font-weight: 600;
  font-size: 0.97rem;
  padding: 0.24rem 1.1rem;
  border-radius: 14px;
  margin-bottom: 0.4rem;
  margin-right: 0.3rem;
`;

const ScoreBarWrap = styled.div`
  width: 94%;
  margin: 0.5rem 0 1.15rem 0;
`;

const ScoreLabel = styled.div`
  font-weight: 700;
  font-size: 1.08rem;
  color: #434d67;
  margin-bottom: 0.15rem;
  text-align: center;
  display: flex; align-items: center; justify-content: center; gap: 6px;
`;

const ScoreBar = styled.div`
  background: #e8f5e8;
  border-radius: 12px;
  width: 100%; height: 15px; overflow: hidden;
`;

const ScoreFill = styled.div`
  background: linear-gradient(90deg, #30c59b 60%, #41d99a 100%);
  height: 100%;
  border-radius: 12px;
  width: ${props => props.score > 100 ? 100 : props.score}%;
  transition: width 0.38s cubic-bezier(0.19,1,0.42,1);
`;

const TechStack = styled.div`
  font-size: 0.99rem;
  color: #5a6277;
  margin: 0.9rem 0 0.45rem 0;
  text-align: center;
  line-height: 1.42;
  max-width: 250px;
  word-break: break-all;
  font-weight: 500;
  & b { font-weight: 700; color: #0e7761; }
`;

const MoreStack = styled.span`
  color: #b8b8b8; font-size: 0.92rem; font-weight: 600; margin-left: 0.4rem;
`;

const AnalysisPreview = styled.div`
  margin-top: 1.13rem;
  font-size: 0.99rem;
  color: #58617b;
  font-style: italic;
  line-height: 1.6;
  min-height: 44px;
  margin-bottom: 1.12rem;
`;

const ShowAnalysisBtn = styled.button`
  background: #30c59b;
  color: #fff;
  border: none;
  border-radius: 7px;
  padding: 0.55rem 1.3rem;
  font-size: 0.97rem;
  font-weight: 700;
  margin-bottom: 0.2rem;
  margin-top: auto;
  cursor: pointer;
  transition: background 0.17s;
  display: flex; align-items: center; gap: 0.5rem;
  &:hover { background: #299c7e;}
`;

// ============ 분석 모달 ============

const ModalOverlay = styled.div`
  position: fixed; top:0; left:0; right:0; bottom:0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 1200;
  display: flex; align-items: center; justify-content: center;
  animation: ${fadeIn} 0.3s cubic-bezier(.36,1.07,.57,1.01);
`;

const ModalCard = styled.div`
  background: #fff;
  border-radius: 24px;
  max-width: 600px;
  width: 95vw;
  min-width: 400px;
  padding: 0;
  box-shadow: 0 25px 100px rgba(0, 0, 0, 0.25);
  position: relative;
  display: flex; flex-direction: column;
  animation: ${fadeIn} 0.4s cubic-bezier(.22,1.04,.38,1.01);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalCloseBtn = styled.button`
  position: absolute; 
  top: 20px; 
  right: 20px;
  background: rgba(255, 255, 255, 0.9); 
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 18px; 
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  z-index: 10;
  &:hover { 
    background: rgba(255, 255, 255, 1);
    color: #333;
    transform: scale(1.1);
  }
`;

const ModalHeader = styled.div`
  padding: 32px 32px 0 32px;
  margin-bottom: 0;
`;

const ModalScoreBarWrap = styled.div`
  margin-bottom: 2.3rem;
`;

const ModalScoreValue = styled.div`
  font-size: 1.11rem;
  font-weight: 700;
  color: #37dfa7;
  display: flex; align-items: center; gap: 0.5rem;
  margin-bottom: 0.4rem;
`;

const ModalScoreBar = styled.div`
  width: 100%;
  background: #f1f5f9;
  height: 12px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ModalScoreFill = styled.div`
  background: linear-gradient(90deg, #10b981 0%, #34d399 50%, #6ee7b7 100%);
  height: 100%;
  width: ${props => props.score > 100 ? 100 : props.score}%;
  border-radius: 6px;
  transition: width 0.8s cubic-bezier(0.17,1,0.33,1);
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
`;

const ModalBody = styled.div`
  font-size: 1.08rem;
  color: #222b38;
  line-height: 1.75;
  white-space: pre-wrap;
  word-break: break-word;
  margin-bottom: 1.8rem;
`;

const ModalFooter = styled.div`
  display: flex; justify-content: flex-end;
  padding: 0 32px 32px 32px;
`;

// 모달 액션 버튼 (Toss 스타일)
const ModalActionBtn = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 32px;
  font-size: 1.08rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.18);
  transition: all 0.18s;
  min-width: 120px;
  &:hover {
    background: linear-gradient(135deg, #5a67d8 0%, #6b21a8 100%);
    transform: translateY(-2px) scale(1.04);
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.22);
  }
`;

// ==========================================

export default function CandidateList() {
  const { postId } = useParams();
  const location = useLocation();
  const [candidates, setCandidates] = useState(location.state?.candidates || []);
  const [selected, setSelected] = useState([]);
  const [postInfo, setPostInfo] = useState(null);
  const [loading, setLoading] = useState(!location.state?.candidates);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [modalScore, setModalScore] = useState(0);

  // ============ [CURRENT 버전에서 추가된 기능] ============
  // 개별 이메일 전송을 위한 로딩 상태 관리
  const [loadingId, setLoadingId] = useState(null);
  // ============ [CURRENT 버전에서 추가된 기능 끝] ============

  // 실제 데이터 fetch (네가 쓰던 코드 그대로!)
  useEffect(() => {
    // 공고 정보 조회
    fetch(`http://localhost:8081/api/postings/info/${postId}`)
      .then(res => {
        if (!res.ok) throw new Error('공고 정보 조회 실패');
        return res.json();
      })
      .then(data => setPostInfo(data))
      .catch(() => setPostInfo(null));

    // 후보자 데이터 조회 (DB에서)
    const fetchCandidates = async () => {
      try {
        const response = await fetch(`http://localhost:8081/api/github-search/by-post/${postId}`);
        if (!response.ok) throw new Error('후보자 데이터 조회 실패');
        const candidatesData = await response.json();

        // AI 분석 결과도 함께 조회
        const aiResponse = await fetch(`http://localhost:8081/api/ai-analysis-results/post/${postId}`);
        let aiAnalysisData = [];
        if (aiResponse.ok) aiAnalysisData = await aiResponse.json();

        const aiAnalysisMap = {};
        aiAnalysisData.forEach(ai => {
          if (ai.githubSearchResultId) aiAnalysisMap[ai.githubSearchResultId] = ai;
        });

        const mappedCandidates = candidatesData.map(candidate => {
          const aiAnalysis = aiAnalysisMap[candidate.githubSearchResultId];
          let portfolioAnalysis = '';
          let candidateLanguages = '';
          console.log(`후보자 ${candidate.githubLogin}의 AI 분석:`, aiAnalysis);
          if (aiAnalysis && aiAnalysis.analysisData) {
            // AI 분석 데이터는 일반 텍스트로 저장되어 있으므로 JSON.parse 하지 않음
            portfolioAnalysis = aiAnalysis.analysisData;
            // GitHub 분석의 경우 언어 정보는 별도로 저장되지 않으므로 빈 문자열로 설정
            candidateLanguages = '';
            console.log(`후보자 ${candidate.githubLogin}의 분석 데이터:`, portfolioAnalysis.substring(0, 100) + '...');
          } else {
            portfolioAnalysis = 'AI 분석 결과 없음';
            console.log(`후보자 ${candidate.githubLogin}의 AI 분석 결과 없음`);
          }
          return {
            githubLogin: candidate.githubLogin,
            candidateEmail: candidate.candidateEmail,
            score: candidate.analysisScore || 0,
            portfolioAnalysis: portfolioAnalysis,
            candidateLanguages: candidateLanguages,
            profileUrl: candidate.githubProfileUrl,
            // ============ [CURRENT 버전에서 추가된 기능] ============
            // 검색일 정보 추가
            githubSearchDate: candidate.githubSearchDate,
            // ============ [CURRENT 버전에서 추가된 기능 끝] ============
            ...candidate
          };
        });

        // ============ [CURRENT 버전에서 추가된 기능] ============
        // 이메일 있는 사람을 먼저, 없는 사람을 나중에 정렬
        const emailFirst = mappedCandidates.filter(c => c.candidateEmail !== 'not_found@example.com');
        const noEmail = mappedCandidates.filter(c => c.candidateEmail === 'not_found@example.com');
        setCandidates([...emailFirst, ...noEmail]);
        // ============ [CURRENT 버전에서 추가된 기능 끝] ============
        setLoading(false);
      } catch (error) {
        setCandidates([]);
        setLoading(false);
      }
    };

    // 후보자가 이미 state로 넘어온 경우
    if (location.state?.candidates) {
      setLoading(false);
      setCandidates(location.state.candidates);
      return;
    }
    fetchCandidates();
  }, [postId, location.state]);

  const toggleSelect = (login) => {
    setSelected(prev =>
      prev.includes(login) ? prev.filter(l => l !== login) : [...prev, login]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const extractSummary = (analysisText) => {
    if (!analysisText) return '';
    const summaryMatch = analysisText.match(/종합요약:\s*([^\n]+(?:\n[^\n]+)*)/);
    if (summaryMatch) return summaryMatch[1].trim();
    return analysisText.length > 85 ? analysisText.substring(0, 85) + '...' : analysisText;
  };
  const extractScore = (analysisText) => {
    if (!analysisText) return 0;
    const scoreMatch = analysisText.match(/\(점수:\s*(\d+)점\)/);
    return scoreMatch ? parseInt(scoreMatch[1]) : 0;
  };

  // 기술스택 가독성 보정
  function getStackArray(langs) {
    if (!langs) return [];
    if (Array.isArray(langs)) return langs;
    if (typeof langs === 'string') {
      return langs.split(/[\s,/]+/).filter(Boolean);
    }
    return [];
  }
  function formatTechStack(langs) {
    const arr = getStackArray(langs);
    if (arr.length <= 5) return arr.join(' · ');
    return arr.slice(0, 5).join(' · ') + <MoreStack>+외 {arr.length - 5}개</MoreStack>;
  }

  const openAnalysisModal = (analysis, score) => {
    console.log('openAnalysisModal 호출됨:', { analysis, score });
    setSelectedAnalysis(analysis);
    setModalScore(score || 0);
    setShowAnalysisModal(true);
  };
  const closeAnalysisModal = () => {
    setShowAnalysisModal(false);
    setSelectedAnalysis(null);
    setModalScore(0);
  };

  // ============ [CURRENT 버전에서 추가된 기능] ============
  // 개별 이메일 전송 기능
  const sendInvitation = async (postId, githubLogin, companyAdminId, candidateEmail) => {
    const payload = {
      postId: parseInt(postId),
      githubLogin,
      companyAdminId,
      candidateEmail,
    };

    try {
      setLoadingId(githubLogin); // 👉 로딩 시작

      const res = await fetch("http://localhost:8081/api/invitations/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("📨 초대 메일을 전송했습니다!");
        console.log("전달한 데이터 : ", payload);
      } else {
        alert("❌ 전송 실패");
      }
    } catch (err) {
      console.error("메일 전송 오류:", err);
      alert("⚠️ 서버 오류로 전송에 실패했습니다.");
    } finally {
      setLoadingId(null); // 👉 로딩 종료
    }
  };
  // ============ [CURRENT 버전에서 추가된 기능 끝] ============

  const handleSendMail = () => {
    const selectedEmails = candidates.filter(c => selected.includes(c.githubLogin || c.login)).map(c => c.candidateEmail);
    alert(`${selectedEmails.length}명에게 메일을 보냅니다:\n` + selectedEmails.join(', '));
  };

  if (loading) {
    return <Wrapper><Navbar /><Container>후보자 목록을 불러오는 중...</Container></Wrapper>;
  }

  return (
    <Wrapper>
      <Navbar />
      <Container>
        {/* 공고 정보 */}
        {postInfo && (
          <PostInfoCard>
            <EditIcon title="공고 정보 수정" onClick={() => alert('공고 정보 수정 페이지로 이동(구현 필요)')} />
            <PostInfoHeader>{postInfo.postTitle}</PostInfoHeader>
            <PostInfoGrid>
              <div><InfoLabel>지역</InfoLabel><InfoText>{postInfo.postLocation || '미정'}</InfoText></div>
              <div><InfoLabel>연봉</InfoLabel><InfoText>{postInfo.postSalaryStart || '0'} ~ {postInfo.postSalaryEnd || '0'}</InfoText></div>
              <div><InfoLabel>모집 인원</InfoLabel><InfoText>{postInfo.postHeadcount || 0}명</InfoText></div>
              <div><InfoLabel>등록일</InfoLabel><InfoText>{formatDate(postInfo.postPostedDate)}</InfoText></div>
            </PostInfoGrid>
            {postInfo.postDescription && (
              <PostDesc>
                <InfoLabel>설명</InfoLabel><InfoText>{postInfo.postDescription}</InfoText>
              </PostDesc>
            )}
          </PostInfoCard>
        )}

        {/* 메일 보내기 버튼 */}
        {selected.length > 0 && (
          <MailButton onClick={handleSendMail}>
            <FaEnvelope />
            {selected.length}명에게 메일 보내기
          </MailButton>
        )}

        {/* 후보자 헤더 */}
        <CandidatesHeader>
          <SectionTitle>🎯 추천 후보자 <b style={{ color: "#30c59b" }}>{candidates.length}</b>명</SectionTitle>
        </CandidatesHeader>

        {/* 포스터 가로 스크롤 */}
        {candidates.length === 0 ? (
          <PostDesc>아직 추천 후보자가 없습니다.<br />검색이 완료되면 후보자 목록이 표시됩니다.</PostDesc>
        ) : (
          <PosterScrollWrap>
            <PostersRow>
              {candidates.map((candidate, idx) => {
                const analysisText = candidate.portfolioAnalysis || candidate.analysis || '';
                const summary = extractSummary(analysisText);
                const score = extractScore(analysisText) || candidate.score || candidate.parsed_score || 0;
                const langsArr = getStackArray(candidate.candidateLanguages || candidate.languages);
                const email = candidate.candidateEmail || candidate.email;
                const login = candidate.githubLogin || candidate.login;

                return (
                  <CandidateCard
                    key={login || idx}
                    selected={selected.includes(login)}
                    onClick={() => toggleSelect(login)}
                  >
                    {/* 점수 ProgressBar */}
                    <ScoreBarWrap>
                      <ScoreLabel>
                        <FaStar style={{ color: '#fabb3b', marginRight: '2px' }} /> 
                        <span style={{fontWeight:'800'}}>{score}점</span>
                      </ScoreLabel>
                      <ScoreBar>
                        <ScoreFill score={score} />
                      </ScoreBar>
                    </ScoreBarWrap>
                    {/* 프로필 */}
                    <Avatar>
                      <FaGithub style={{ color: 'white', fontSize: '2.5rem' }} />
                    </Avatar>
                    <Username>{login}</Username>
                    <CardMeta>
                      {email && <MetaTag>이메일 있음</MetaTag>}
                      {candidate.candidateLocation &&
                        <MetaTag style={{ background: '#eaf1fd', color: '#4575d5' }}>
                          {candidate.candidateLocation}
                        </MetaTag>}
                    </CardMeta>
                    {/* 기술스택/언어 */}
                    {langsArr.length > 0 &&
                      <TechStack>
                        <b>기술스택:</b> {formatTechStack(langsArr)}
                      </TechStack>
                    }
                    {/* 분석 요약 */}
                    <AnalysisPreview>{summary}</AnalysisPreview>
                    <ShowAnalysisBtn
                      onClick={e => { e.stopPropagation(); openAnalysisModal(analysisText, score); }}>
                      <FaExpandAlt /> 전체 분석 보기
                    </ShowAnalysisBtn>
                    {/* ============ [CURRENT 버전에서 추가된 기능] ============ */}
                    {/* 개별 이메일 전송 버튼 */}
                    {email && email !== 'not_found@example.com' && (
                      <button
                        onClick={e => { 
                          e.stopPropagation(); 
                          sendInvitation(postId, login, 42, email);
                        }}
                        disabled={loadingId === login}
                        style={{
                          backgroundColor: loadingId === login ? '#ccc' : '#30c59b',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '999px',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '160px',
                          height: '42px',
                          border: 'none',
                          cursor: loadingId === login ? 'not-allowed' : 'pointer',
                          position: 'relative',
                          opacity: loadingId === login ? 0.6 : 1,
                          filter: loadingId === login ? 'blur(0.5px)' : 'none',
                          marginTop: '0.5rem'
                        }}
                      >
                        {loadingId === login ? (
                          <div
                            style={{
                              width: '20px',
                              height: '20px',
                              border: '3px solid #fff',
                              borderTop: '3px solid transparent',
                              borderRadius: '50%',
                              animation: 'spin 1s linear infinite'
                            }}
                          />
                        ) : (
                          <>
                            <FaEnvelope />
                            <span>이메일 보내기</span>
                          </>
                        )}
                      </button>
                    )}
                    {/* ============ [CURRENT 버전에서 추가된 기능 끝] ============ */}
                  </CandidateCard>
                );
              })}
            </PostersRow>
          </PosterScrollWrap>
        )}
      </Container>

      {/* --- AI 분석 모달 --- */}
      {showAnalysisModal && selectedAnalysis && (
        <ModalOverlay onClick={closeAnalysisModal}>
          <ModalCard onClick={e => e.stopPropagation()}>
            <ModalCloseBtn onClick={closeAnalysisModal}>
              <FaTimes />
            </ModalCloseBtn>
            
            {/* 헤더 섹션 */}
            <ModalHeader>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}>
                  <FaCode style={{ color: 'white', fontSize: '20px' }} />
                </div>
                <div>
                  <h2 style={{ 
                    margin: 0, 
                    fontSize: '24px', 
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    AI 분석 상세 결과
                  </h2>
                  <p style={{ 
                    margin: '4px 0 0 0', 
                    fontSize: '14px', 
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>
                    종합적인 개발자 역량 평가
                  </p>
                </div>
              </div>
            </ModalHeader>

            {/* 점수 섹션 */}
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              borderRadius: '16px',
              padding: '20px',
              margin: '20px 0',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaStar style={{ color: '#fbbf24', fontSize: '20px' }} />
                  <span style={{ 
                    fontSize: '18px', 
                    fontWeight: '700',
                    color: '#1f2937'
                  }}>
                    종합 평가 점수
                  </span>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '16px',
                  fontWeight: '700',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}>
                  {modalScore}점
                </div>
              </div>
              <ModalScoreBar>
                <ModalScoreFill score={modalScore} />
              </ModalScoreBar>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginTop: '8px',
                fontSize: '12px',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                <span>0점</span>
                <span>100점</span>
              </div>
            </div>

            {/* 분석 내용 섹션 */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 16px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '4px',
                  height: '20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '2px'
                }} />
                상세 분석 결과
              </h3>
              <div style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                maxHeight: '400px',
                overflowY: 'auto',
                lineHeight: '1.6',
                fontSize: '15px',
                color: '#374151',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)'
              }}>
                {selectedAnalysis.split('\n').map((line, index) => (
                  <p key={index} style={{ 
                    margin: line.trim() ? '0 0 12px 0' : '0 0 8px 0',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {line}
                  </p>
                ))}
              </div>
            </div>

            {/* 푸터 */}
            <ModalFooter>
              <ModalActionBtn onClick={closeAnalysisModal}>
                확인
              </ModalActionBtn>
            </ModalFooter>
          </ModalCard>
        </ModalOverlay>
      )}
    </Wrapper>
  );
}

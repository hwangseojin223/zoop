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
  background: rgba(12,24,46,0.53);
  z-index: 1200;
  display: flex; align-items: center; justify-content: center;
  animation: ${fadeIn} 0.26s cubic-bezier(.36,1.07,.57,1.01);
`;

const ModalCard = styled.div`
  background: #fff;
  border-radius: 22px;
  max-width: 480px;
  width: 95vw;
  min-width: 340px;
  padding: 2.8rem 2rem 2.1rem 2rem;
  box-shadow: 0 18px 80px rgba(30,70,80,0.20);
  position: relative;
  display: flex; flex-direction: column;
  animation: ${fadeIn} 0.35s cubic-bezier(.22,1.04,.38,1.01);
`;

const ModalCloseBtn = styled.button`
  position: absolute; top: 1.25rem; right: 1.35rem;
  background: none; border: none;
  font-size: 2rem; color: #aaa;
  cursor: pointer;
  transition: color 0.2s;
  &:hover { color: #333; }
`;

const ModalHeader = styled.div`
  font-size: 1.4rem;
  font-weight: 800;
  color: #1b2437;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1.3rem;
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
  background: #e8f5e8;
  height: 15px;
  border-radius: 10px;
  overflow: hidden;
`;

const ModalScoreFill = styled.div`
  background: linear-gradient(90deg, #30c59b 65%, #7df6c7 100%);
  height: 100%;
  width: ${props => props.score > 100 ? 100 : props.score}%;
  border-radius: 10px;
  transition: width 0.37s cubic-bezier(0.17,1,0.33,1);
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
`;

const ModalActionBtn = styled.button`
  background: #30c59b;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.82rem 2.1rem;
  font-size: 1.08rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: #28a085;}
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
          if (aiAnalysis && aiAnalysis.analysisData) {
            try {
              const analysisData = JSON.parse(aiAnalysis.analysisData);
              portfolioAnalysis = analysisData.analysis || '';
              candidateLanguages = analysisData.languages || '';
            } catch {
              portfolioAnalysis = '분석 데이터 파싱 오류';
            }
          } else {
            portfolioAnalysis = 'AI 분석 결과 없음';
          }
          return {
            githubLogin: candidate.githubLogin,
            candidateEmail: candidate.candidateEmail,
            score: candidate.analysisScore || 0,
            portfolioAnalysis: portfolioAnalysis,
            candidateLanguages: candidateLanguages,
            profileUrl: candidate.githubProfileUrl,
            ...candidate
          };
        });
        setCandidates(mappedCandidates);
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
      return langs.split(/[\s,\/]+/).filter(Boolean);
    }
    return [];
  }
  function formatTechStack(langs) {
    const arr = getStackArray(langs);
    if (arr.length <= 5) return arr.join(' · ');
    return arr.slice(0, 5).join(' · ') + <MoreStack>+외 {arr.length - 5}개</MoreStack>;
  }

  const openAnalysisModal = (analysis, score) => {
    setSelectedAnalysis(analysis);
    setModalScore(score || 0);
    setShowAnalysisModal(true);
  };
  const closeAnalysisModal = () => {
    setShowAnalysisModal(false);
    setSelectedAnalysis(null);
    setModalScore(0);
  };

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
            <ModalCloseBtn onClick={closeAnalysisModal}><FaTimes /></ModalCloseBtn>
            <ModalHeader><FaCode />AI 분석 상세 결과</ModalHeader>
            {/* 모달 점수 ProgressBar */}
            <ModalScoreBarWrap>
              <ModalScoreValue>
                <FaStar style={{ color: '#fabb3b' }} />
                <span style={{fontWeight:800, color:'#30c59b'}}>{modalScore}점</span>
              </ModalScoreValue>
              <ModalScoreBar>
                <ModalScoreFill score={modalScore} />
              </ModalScoreBar>
            </ModalScoreBarWrap>
            <ModalBody>{selectedAnalysis}</ModalBody>
            <ModalFooter>
              <ModalActionBtn onClick={closeAnalysisModal}>닫기</ModalActionBtn>
            </ModalFooter>
          </ModalCard>
        </ModalOverlay>
      )}
    </Wrapper>
  );
}

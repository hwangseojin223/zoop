import React, { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;

/** */
export default function CandidateModal({ candidate, isOpen, onClose, postId, avatarUrl }) {
  const [zoom, setZoom] = useState(1.1); // 초기값 110%
  const [containerWidth, setContainerWidth] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [numPages, setNumPages] = useState(null);
  const containerRef = useRef(null);
  const modalRef = useRef(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [jobCandidateId, setJobCandidateId] = useState(null);
  const [portfolioMatches, setPortfolioMatches] = useState([]);

  // 예시: 필요한 값이 없을 경우 대비하여 상태 저장
  const [invitationTimes, setInvitationTimes] = useState([]);
  const [portfolioDate, setPortfolioDate] = useState(null);
  const [interviewSchedule, setInterviewSchedule] = useState(null);

  // 하단 드롭다운용 상태 정의
  const [portfolioAnalysis, setPortfolioAnalysis] = useState(null);
  const [interviewVideoUrl, setInterviewVideoUrl] = useState(null);
  const [interviewAnalysis, setInterviewAnalysis] = useState(null);

  // 아코디언 open을 위한 상태
  const [portfolioPreviewOpen, setPortfolioPreviewOpen] = useState(false); // 포트폴리오 미리보기
  const [portfolioAnalysisOpen, setPortfolioAnalysisOpen] = useState(false); // 포트폴리오 분석
  const [interviewVideoOpen, setInterviewVideoOpen] = useState(false); // 면접 영상
  const [interviewAnalysisOpen, setInterviewAnalysisOpen] = useState(false); // 면접 분석
  const [matchingInfoOpen, setMatchingInfoOpen] = useState(false); // 매칭 정보

  const [videoBlobUrl, setVideoBlobUrl] = useState(null);
  const [localStage, setLocalStage] = useState(candidate?.jobCandCurrStage);

  // candidate가 변경될 때 localStage 동기화
  useEffect(() => {
    if (candidate?.jobCandCurrStage) {
      setLocalStage(candidate.jobCandCurrStage);
    }
  }, [candidate?.jobCandCurrStage]);

  // cand_portfolio_id로 매칭 정보 조회
  useEffect(() => {
    if (!candidate?.candPortfolioId) {
      setPortfolioMatches([]);
      return;
    }
    fetch(`http://localhost:8081/api/portfolio-job-matches/portfolio/${candidate.candPortfolioId}`)
      .then(res => res.json())
      .then(data => setPortfolioMatches(Array.isArray(data) ? data : []))
      .catch(() => setPortfolioMatches([]));
  }, [candidate?.candPortfolioId]);

  /** 아코디언 */
  const Accordion = ({ title, open, setOpen, children }) => (
    <div className="mb-6 overflow-hidden">
      <button
        onClick={() => setOpen(prev => !prev)}
        className="w-full text-left px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-t-2xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-between"
      >
        <span className="text-lg">{title}</span>
        <div className={`transform transition-transform duration-300 ${open ? 'rotate-180' : 'rotate-0'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <div className={`bg-white shadow-lg transition-all duration-500 ease-in-out ${
        open ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
      } overflow-hidden rounded-b-2xl`}>
        <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
          {children}
        </div>
      </div>
    </div>
  );

  // jobCandidateId 조회
  useEffect(() => {
    if (!isOpen || !candidate || !postId) return;

    fetch(`http://localhost:8081/api/progress/${postId}/${candidate.githubLogin}/job-candidate-id`)
      .then(res => {
        if (!res.ok) throw new Error('jobCandidateId 조회 실패');
        return res.json();
      })
      .then(data => {
        console.log('jobCandidateId 조회 성공:', data.jobCandidateId);
        console.log("candidate: ", candidate);
        console.log("postId: ", postId);
        setJobCandidateId(data.jobCandidateId);
      })
      .catch(err => {
        console.error('jobCandidateId 조회 오류:', err);
        setJobCandidateId(null);
      });
  }, [isOpen, candidate, postId]);

  // 모달이 열릴 때 stage에 따라 API 호출
  useEffect(() => {
    if (!isOpen || !candidate || !jobCandidateId) {
      console.log("--------------------------------");
      console.log("isOpen: ", isOpen);
      console.log("candidate: ", candidate);
      console.log("jobCandidateId: ", jobCandidateId);
      console.log("--------------------------------");
      return;
    }

    const stage = candidate.jobCandCurrStage;
    const githubLogin = candidate.githubLogin;

    // invitationSentDate
    if (["2n", "2y", "2p", "3n", "3y", "4n", "4y"].includes(stage)) {
      fetch(`http://localhost:8081/api/invitations/${postId}/${githubLogin}/sent-times`)
        .then(res => {
          if (!res.ok) throw new Error('invitationSentDate 조회 실패');
          return res.json();
        })
        .then(data => {
          console.log("invitationSentDate 조회 성공:", data);
          if (data && data.length > 0 && data[0].invitationSentDate) {
            setInvitationTimes(data[0].invitationSentDate);
            console.log("data: ", data);
            console.log("data[0]: ", data[0]);
            console.log("data[0].invitationSentDate: ", data[0].invitationSentDate);
            console.log("invitationTimes: ", invitationTimes);
          } else {
            console.log("invitationSentDate 데이터가 없습니다.");
            setInvitationTimes(null);
          }
        })
        .catch(err => {
          console.error('invitationSentDate 조회 오류:', err);
          setInvitationTimes(null);
        });
    }

    // portfolioSubmissionDate 
    if (["2y", "2p", "3n", "3y", "4n", "4y"].includes(stage)) {
      fetch(`http://localhost:8081/api/portfolios/${jobCandidateId}/submission-date`)
        .then(res => {
          if (!res.ok) throw new Error('portfolioSubmissionDate 조회 실패');
          return res.json();
        })
        .then(data => {
          console.log("portfolioSubmissionDate 조회 성공:", data);
          if (data && data.portfolioSubmissionDate) {
            setPortfolioDate(data.portfolioSubmissionDate);
          } else {
            console.log("portfolioSubmissionDate 데이터가 없습니다.");
            setPortfolioDate(null);
          }
        })
        .catch(err => {
          console.error('portfolioSubmissionDate 조회 오류:', err);
          setPortfolioDate(null);
        });
    }

    // interviewSchedule
    if (["3n", "3y", "4n", "4y"].includes(stage)) {
      fetch(`http://localhost:8081/api/interview-schedules/${jobCandidateId}/schedule`)
        .then(res => {
          if (!res.ok) throw new Error('interviewSchedule 조회 실패');
          return res.json();
        })
        .then(data => {
          console.log("interviewSchedule 조회 성공:", data);
          if (data) {
            setInterviewSchedule(data);
          } else {
            console.log("interviewSchedule 데이터가 없습니다.");
            setInterviewSchedule(null);
          }
        })
        .catch(err => {
          console.error('interviewSchedule 조회 오류:', err);
          setInterviewSchedule(null);
        });
    }

    // 포트폴리오 분석
    if (["2y", "2p", "3n", "3y", "4n", "4y"].includes(stage)) {
      fetch(`http://localhost:8081/api/analysis/${jobCandidateId}/portfolio`)
        .then(res => {
          if (!res.ok) throw new Error('portfolioAnalysis 조회 실패');
          return res.json();
        })
        .then(data => {
          console.log("portfolioAnalysis 조회 성공:", data);
          if (data) {
            setPortfolioAnalysis(data);
          } else {
            console.log("portfolioAnalysis 데이터가 없습니다.");
            setPortfolioAnalysis(null);
          }
        })
        .catch(err => {
          console.error('portfolioAnalysis 조회 오류:', err);
          setPortfolioAnalysis(null);
        });
    }

    
    // 면접 영상
    if (["3y", "4n", "4y"].includes(stage)) {
      fetch(`http://localhost:8081/api/interviews/${jobCandidateId}/video`)
        .then(res => {
          if (!res.ok) throw new Error('interviewVideo 조회 실패');
          return res.blob();
        })
        .then(blob => {
          console.log("interviewVideo 조회 성공:", blob);
          const url = URL.createObjectURL(blob);
          setVideoBlobUrl(url);
          setInterviewVideoUrl(url);
        })
        .catch(err => {
          console.error('interviewVideo 조회 오류:', err);
          setVideoBlobUrl(null);
          setInterviewVideoUrl(null);
        });
    }

    // 면접 분석
    if (["4n", "4y"].includes(stage)) {
      fetch(`http://localhost:8081/api/analysis/${jobCandidateId}/interview`)
        .then(res => {
          if (!res.ok) throw new Error('interviewAnalysis 조회 실패');
          return res.json();
        })
        .then(data => {
          console.log("interviewAnalysis 조회 성공:", data);
          if (data) {
            setInterviewAnalysis(data);
          } else {
            console.log("interviewAnalysis 데이터가 없습니다.");
            setInterviewAnalysis(null);
          }
        })
        .catch(err => {
          console.error('interviewAnalysis 조회 오류:', err);
          setInterviewAnalysis(null);
        });
    }

  }, [isOpen, candidate, jobCandidateId, postId]);

  // PDF 파일 조회
  useEffect(() => {
    if (!isOpen || !candidate || !jobCandidateId) return;

    fetch(`http://localhost:8081/api/portfolios/${jobCandidateId}/pdf`)
      .then(res => {
        if (!res.ok) throw new Error('PDF 조회 실패');
        return res.blob();
      })
      .then(blob => {
        console.log("PDF 조회 성공:", blob);
        const url = URL.createObjectURL(blob);
        setPdfBlobUrl(url);
      })
      .catch(err => {
        console.error('PDF 조회 오류:', err);
        setPdfBlobUrl(null);
      });
  }, [isOpen, candidate, jobCandidateId]);

  // 컴포넌트 언마운트 시 URL 해제
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
      if (videoBlobUrl) {
        URL.revokeObjectURL(videoBlobUrl);
      }
    };
  }, [pdfBlobUrl, videoBlobUrl]);

  // 컨테이너 너비 업데이트
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const prev = () => setCurrentIdx(idx => (idx === 0 ? numPages - 1 : idx - 1));
  const next = () => setCurrentIdx(idx => (idx === numPages - 1 ? 0 : idx + 1));
  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

  const handleInterviewInvitation = async () => {
    if (!candidate || !postId) {
      alert('후보자 정보 또는 공고 정보가 없습니다.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8081/api/interview-schedules/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: postId,
          candidateId: candidate.candidateId,
          githubLogin: candidate.githubLogin
        }),
      });

      if (response.ok) {
        alert('면접 초대가 성공적으로 전송되었습니다.');
        // 성공 후 모달 닫기
        onClose();
      } else {
        const errorData = await response.json();
        alert(`면접 초대 전송 실패: ${errorData.message || '알 수 없는 오류가 발생했습니다.'}`);
      }
    } catch (error) {
      console.error('면접 초대 전송 중 오류:', error);
      alert('면접 초대 전송 중 오류가 발생했습니다.');
    }
  };

  const handleClose = () => {
    // URL 해제
    if (pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl);
      setPdfBlobUrl(null);
    }
    if (videoBlobUrl) {
      URL.revokeObjectURL(videoBlobUrl);
      setVideoBlobUrl(null);
    }
    
    // 상태 초기화
    setCurrentIdx(0);
    setNumPages(null);
    setJobCandidateId(null);
    setInvitationTimes(null);
    setPortfolioDate(null);
    setInterviewSchedule(null);
    setPortfolioAnalysis(null);
    setInterviewVideoUrl(null);
    setInterviewAnalysis(null);
    setPortfolioMatches([]);
    
    // 아코디언 상태 초기화
    setPortfolioPreviewOpen(false);
    setPortfolioAnalysisOpen(false);
    setInterviewVideoOpen(false);
    setInterviewAnalysisOpen(false);
    setMatchingInfoOpen(false);
    
    onClose();
  };

  const ScoreCard = ({ title, score, max = 100, color, icon }) => (
    <div className={`bg-gradient-to-br ${color} p-6 rounded-2xl shadow-lg text-white`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">{title}</h3>
        <div className="text-2xl">{icon}</div>
      </div>
      <div className="text-3xl font-bold mb-2">{score}/{max}</div>
      <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
        <div 
          className="bg-white h-2 rounded-full transition-all duration-500" 
          style={{ width: `${(score / max) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  const PortfolioScoreCard = ({ score, max = 100, color, icon }) => (
    <div className={`bg-gradient-to-br ${color} p-6 rounded-2xl shadow-lg text-white`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">포트폴리오 분석</h3>
        <div className="text-2xl">{icon}</div>
      </div>
      <div className="text-3xl font-bold mb-2">{score}/{max}</div>
      <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
        <div 
          className="bg-white h-2 rounded-full transition-all duration-500" 
          style={{ width: `${(score / max) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  const InterviewScoreCard = ({ score, max = 100, color, icon }) => (
    <div className={`bg-gradient-to-br ${color} p-6 rounded-2xl shadow-lg text-white`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">면접 분석</h3>
        <div className="text-2xl">{icon}</div>
      </div>
      <div className="text-3xl font-bold mb-2">{score}/{max}</div>
      <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
        <div 
          className="bg-white h-2 rounded-full transition-all duration-500" 
          style={{ width: `${(score / max) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  function formatKoreanDateTime(dateString) {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
    } catch (error) {
      console.error('날짜 파싱 오류:', error);
      return 'N/A';
    }
  }

  // 매칭 점수에 따른 등급 반환
  const getMatchingGrade = (score) => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (score >= 80) return { grade: 'A', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (score >= 70) return { grade: 'B+', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (score >= 60) return { grade: 'B', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (score >= 50) return { grade: 'C+', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { grade: 'C', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  // 매칭 근거 파싱 함수
  const parseMatchingReason = (reason) => {
    if (!reason) return { items: [], recommendation: '', summary: '' };
    
    try {
      // JSON 형태로 파싱 시도
      const parsed = JSON.parse(reason);
      return {
        items: parsed.items || [],
        recommendation: parsed.recommendation || '',
        summary: parsed.summary || ''
      };
    } catch {
      // 일반 텍스트인 경우
      return {
        items: [],
        recommendation: '',
        summary: reason
      };
    }
  };

  if (!isOpen || !candidate) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
        style={{ maxWidth: '1200px' }}
      >
        {/* 헤더 */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6 rounded-t-3xl shadow-lg z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold">
                  {candidate.candidateName ? candidate.candidateName.charAt(0) : '?'}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{candidate.candidateName || '이름 없음'}</h2>
                <p className="text-emerald-100">@{candidate.githubLogin}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-emerald-200 transition-colors duration-200"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 내용 */}
        <div className="p-6 space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-200">
              <h3 className="font-semibold text-gray-700 mb-2">현재 단계</h3>
              <p className="text-2xl font-bold text-blue-600">{localStage || 'N/A'}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-200">
              <h3 className="font-semibold text-gray-700 mb-2">이메일</h3>
              <p className="text-sm text-gray-600 break-all">{candidate.candidateEmail || 'N/A'}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-2xl border border-purple-200">
              <h3 className="font-semibold text-gray-700 mb-2">전화번호</h3>
              <p className="text-sm text-gray-600">{candidate.candidatePhoneNumber || 'N/A'}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-2xl border border-orange-200">
              <h3 className="font-semibold text-gray-700 mb-2">가입일</h3>
              <p className="text-sm text-gray-600">{formatKoreanDateTime(candidate.candidateRegistrationDate)}</p>
            </div>
          </div>

          {/* 진행 상황 */}
          <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-3xl border border-gray-200 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📋 진행 상황</h3>
            <div className="space-y-4">
              {invitationTimes && (
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">초대 전송: {formatKoreanDateTime(invitationTimes)}</span>
                </div>
              )}
              {portfolioDate && (
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">포트폴리오 제출: {formatKoreanDateTime(portfolioDate)}</span>
                </div>
              )}
              {interviewSchedule && (
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">면접 일정: {formatKoreanDateTime(interviewSchedule.interviewDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* 🎯 매칭 정보 */}
          {portfolioMatches.length > 0 && (
            <Accordion
              title="🎯 매칭 정보"
              open={matchingInfoOpen}
              setOpen={setMatchingInfoOpen}
            >
              <div className="space-y-6">
                {portfolioMatches.map((match, index) => {
                  const grade = getMatchingGrade(match.matchingScore);
                  const parsedReason = parseMatchingReason(match.matchingReason);
                  
                  return (
                    <div key={match.matchId || index} className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-3xl border border-blue-200 shadow-lg">
                      {/* 매칭 점수 메인 카드 */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-3 animate-pulse"></div>
                          <h4 className="font-bold text-gray-800 text-xl">AI 매칭 점수</h4>
                        </div>
                        <div className={`px-4 py-2 rounded-full ${grade.bgColor} ${grade.color} font-bold text-lg`}>
                          {grade.grade} ({match.matchingScore}점)
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-4">
                        매칭 분석일: {formatKoreanDateTime(match.matchCreatedAt)}
                      </div>

                      {/* 매칭 근거 */}
                      {parsedReason.summary && (
                        <div className="bg-white bg-opacity-60 p-4 rounded-2xl mb-4">
                          <h5 className="font-semibold text-gray-800 mb-2">매칭 근거</h5>
                          <p className="text-gray-700 leading-relaxed">{parsedReason.summary}</p>
                        </div>
                      )}

                      {/* 추천 직무 */}
                      {parsedReason.recommendation && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-200">
                          <h5 className="font-semibold text-green-800 mb-2">추천 직무</h5>
                          <p className="text-green-700">{parsedReason.recommendation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Accordion>
          )}

          {/* 📄 포트폴리오 미리보기 */}
          {pdfBlobUrl && (
            <Accordion
              title="📄 포트폴리오 미리보기"
              open={portfolioPreviewOpen}
              setOpen={setPortfolioPreviewOpen}
            >
              <div ref={containerRef} className="relative">
                <Document
                  file={pdfBlobUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  className="flex justify-center"
                >
                  <Page
                    pageNumber={currentIdx + 1}
                    width={Math.min(containerWidth * 0.9, 800)}
                    scale={zoom}
                    className="shadow-lg rounded-lg"
                  />
                </Document>
                
                {numPages > 1 && (
                  <div className="flex justify-center items-center space-x-4 mt-4">
                    <button
                      onClick={prev}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      이전
                    </button>
                    <span className="text-gray-600">
                      {currentIdx + 1} / {numPages}
                    </span>
                    <button
                      onClick={next}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      다음
                    </button>
                  </div>
                )}
                
                <div className="flex justify-center mt-4 space-x-2">
                  <button
                    onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    축소
                  </button>
                  <button
                    onClick={() => setZoom(1.1)}
                    className="px-3 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
                  >
                    기본
                  </button>
                  <button
                    onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    확대
                  </button>
                </div>
              </div>
            </Accordion>
          )}

          {/* 📊 포트폴리오 분석 */}
          {portfolioAnalysis && (
            <Accordion
              title="📊 포트폴리오 분석"
              open={portfolioAnalysisOpen}
              setOpen={setPortfolioAnalysisOpen}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <PortfolioScoreCard
                  score={portfolioAnalysis.technicalScore || 0}
                  color="from-blue-500 to-indigo-600"
                  icon="💻"
                />
                <PortfolioScoreCard
                  score={portfolioAnalysis.communicationScore || 0}
                  color="from-green-500 to-emerald-600"
                  icon="💬"
                />
                <PortfolioScoreCard
                  score={portfolioAnalysis.problemSolvingScore || 0}
                  color="from-purple-500 to-violet-600"
                  icon="🧩"
                />
              </div>
              
              {portfolioAnalysis.overallEvaluation && (
                <div className="mt-6 bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-3">종합평가</h4>
                  <p className="text-gray-700 leading-relaxed">{portfolioAnalysis.overallEvaluation}</p>
                </div>
              )}
            </Accordion>
          )}

          {/* 🎥 면접 영상 */}
          {interviewVideoUrl && (
            <Accordion
              title="🎥 면접 영상"
              open={interviewVideoOpen}
              setOpen={setInterviewVideoOpen}
            >
              <div className="flex justify-center">
                <video
                  controls
                  className="max-w-full rounded-2xl shadow-lg"
                  style={{ maxHeight: '500px' }}
                >
                  <source src={interviewVideoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </Accordion>
          )}

          {/* 📈 면접 분석 */}
          {interviewAnalysis && (
            <Accordion
              title="📈 면접 분석"
              open={interviewAnalysisOpen}
              setOpen={setInterviewAnalysisOpen}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InterviewScoreCard
                  score={interviewAnalysis.communicationScore || 0}
                  color="from-blue-500 to-indigo-600"
                  icon="💬"
                />
                <InterviewScoreCard
                  score={interviewAnalysis.confidenceScore || 0}
                  color="from-green-500 to-emerald-600"
                  icon="💪"
                />
                <InterviewScoreCard
                  score={interviewAnalysis.problemSolvingScore || 0}
                  color="from-purple-500 to-violet-600"
                  icon="🧩"
                />
              </div>
              
              {interviewAnalysis.overallEvaluation && (
                <div className="mt-6 bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-3">종합평가</h4>
                  <p className="text-gray-700 leading-relaxed">{interviewAnalysis.overallEvaluation}</p>
                </div>
              )}
            </Accordion>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-3xl shadow-lg">
          <div className="flex justify-end space-x-4">
            {["3n", "3y", "4n", "4y"].includes(localStage) && (
              <button
                onClick={handleInterviewInvitation}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                면접 초대
              </button>
            )}
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-2xl hover:bg-gray-600 transition-all duration-300"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
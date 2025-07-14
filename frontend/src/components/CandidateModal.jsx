import React, { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;

/** */
export default function CandidateModal({ candidate, isOpen, onClose, postId }) {
  const [zoom, setZoom] = useState(1.2);
  const [containerWidth, setContainerWidth] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [numPages, setNumPages] = useState(null);
  const containerRef = useRef(null);
  const modalRef = useRef(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [jobCandidateId, setJobCandidateId] = useState(null);

  // 예시: 필요한 값이 없을 경우 대비하여 상태 저장
  const [invitationTimes, setInvitationTimes] = useState([]);
  const [portfolioDate, setPortfolioDate] = useState(null);
  const [interviewSchedule, setInterviewSchedule] = useState(null);

  // 하단 드롭다운용 상태 정의
  const [portfolioAnalysis, setPortfolioAnalysis] = useState(null);
  const [interviewVideoUrl, setInterviewVideoUrl] = useState(null);
  const [interviewAnalysis, setInterviewAnalysis] = useState(null);
  const [matchingInfo, setMatchingInfo] = useState(null);

  // 아코디언 open을 위한 상태
  const [portfolioPreviewOpen, setPortfolioPreviewOpen] = useState(false); // 포트폴리오 미리보기
  const [portfolioAnalysisOpen, setPortfolioAnalysisOpen] = useState(false); // 포트폴리오 분석
  const [interviewVideoOpen, setInterviewVideoOpen] = useState(false); // 면접 영상
  const [interviewAnalysisOpen, setInterviewAnalysisOpen] = useState(false); // 면접 분석
  const [matchingInfoOpen, setMatchingInfoOpen] = useState(false); // 매칭 정보

  const [videoBlobUrl, setVideoBlobUrl] = useState(null);
  const [localStage, setLocalStage] = useState(candidate?.jobCandCurrStage);
  const [portfolioMatches, setPortfolioMatches] = useState([]);

  // candidate가 변경될 때 localStage 동기화
  useEffect(() => {
    if (candidate?.jobCandCurrStage) {
      setLocalStage(candidate.jobCandCurrStage);
    }
  }, [candidate?.jobCandCurrStage]);

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
    if (!isOpen || !candidate) {
      console.log("--------------------------------");
      console.log("isOpen: ", isOpen);
      console.log("candidate: ", candidate);
      console.log("jobCandidateId: ", jobCandidateId);
      console.log("--------------------------------");
      return;
    }

    // jobCandidateId가 아직 로딩 중이면 대기
    if (!jobCandidateId) {
      console.log("jobCandidateId가 아직 로딩 중입니다...");
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
      console.log("포트폴리오 분석 조회 시작 - jobCandidateId:", jobCandidateId);
      
      fetch(`http://localhost:8081/api/analysis/${jobCandidateId}/portfolio`)
        .then(res => {
          console.log("포트폴리오 분석 조회 응답:", res.status);
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
          return res.json();
        })
        .then(data => {
          console.log("interviewVideo 조회 성공:", data);
          if (data && data.videoUrl) {
            setInterviewVideoUrl(data.videoUrl);
          } else {
            console.log("interviewVideo 데이터가 없습니다.");
            setInterviewVideoUrl(null);
          }
        })
        .catch(err => {
          console.error('interviewVideo 조회 오류:', err);
          setInterviewVideoUrl(null);
        });

      // 면접 분석
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

    // 매칭 정보 조회 (2y 단계인 경우)
    if (["2y", "3n", "3y", "4n", "4y"].includes(stage)) {
      console.log("매칭 정보 조회 시작 - stage:", stage, "githubLogin:", githubLogin);
      
      // candidate_id 조회
      fetch(`http://localhost:8081/api/candidates/github/${githubLogin}`)
        .then(res => {
          console.log("candidate_id 조회 응답:", res.status);
          if (!res.ok) throw new Error('candidate_id 조회 실패');
          return res.json();
        })
        .then(candidateData => {
          const candidateId = candidateData.candidateId;
          console.log("candidateId 조회 성공:", candidateId);
          
          // 매칭 정보 조회
          console.log("매칭 정보 조회 API 호출:", `http://localhost:8081/api/portfolio-job-matches/candidate/${candidateId}/post/${postId}`);
          return fetch(`http://localhost:8081/api/portfolio-job-matches/candidate/${candidateId}/post/${postId}`);
        })
        .then(res => {
          console.log("매칭 정보 조회 응답:", res.status);
          if (!res.ok) throw new Error('matchingInfo 조회 실패');
          return res.json();
        })
        .then(data => {
          console.log("matchingInfo 조회 성공:", data);
          setMatchingInfo(data);
        })
        .catch(err => {
          console.error('matchingInfo 조회 오류:', err);
          setMatchingInfo(null);
        });
    }
    
  }, [isOpen, candidate, jobCandidateId]);

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

  // jobCandidateId 상태 변경 추적
  useEffect(() => {
    console.log("🔍 jobCandidateId 상태 변경:", jobCandidateId);
  }, [jobCandidateId]);

  // useEffect(() => {
  //   console.log("📩 invitationTimes 상태 업데이트:", invitationTimes);
  // }, [invitationTimes]);

  // useEffect(() => {
  //   console.log("📁 portfolioDate 상태 업데이트:", portfolioDate);
  // }, [portfolioDate]);

  // useEffect(() => {
  //   console.log("📅 interviewSchedule 상태 업데이트:", interviewSchedule);
  // }, [interviewSchedule]);

  useEffect(() => {
    console.log("📅 interviewVideoUrl 상태 업데이트:", interviewVideoUrl);
  }, [interviewVideoUrl]);

  /**포트폴리오를 불러오기 위한 useState */
  useEffect(() => {
    // candPortfolioId로만 조회
    const candPortfolioId = matchingInfo && matchingInfo.candPortfolioId;
    if (!candPortfolioId) {
      setPdfBlobUrl(null);
      return;
    }
    fetch(`http://localhost:8081/api/portfolios/${candPortfolioId}`)
      .then(res => {
        if (!res.ok) throw new Error('포트폴리오 조회 실패');
        return res.json();
      })
      .then(portfolio => {
        if (!portfolio) {
          setPdfBlobUrl(null);
          return;
        }
        const filePath = portfolio.portfolioFilePath;
        if (!filePath) {
          setPdfBlobUrl(null);
          return;
        }
        const isS3Url = filePath.startsWith('https://') && filePath.includes('s3');
        let url;
        if (isS3Url) {
          url = `http://localhost:8081/api/files/s3/download?s3Url=${encodeURIComponent(filePath)}`;
        } else {
          const filename = filePath.split('/').pop();
          url = `http://localhost:8081/api/files/download/${filename}`;
        }
        return fetch(url);
      })
      .then(res => {
        if (!res) return null;
        if (!res.ok) throw new Error('파일 다운로드 실패');
        return res.blob();
      })
      .then(blob => {
        if (!blob) return;
        const blobUrl = URL.createObjectURL(blob);
        setPdfBlobUrl(blobUrl);
      })
      .catch(err => {
        setPdfBlobUrl(null);
      });
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [matchingInfo]);

  
  /** 면접영상을 불러오기 위한 useState */
  useEffect(() => {
    if (!interviewVideoUrl) return;

    // S3 URL인지 로컬 파일 경로인지 확인
    const isS3Url = interviewVideoUrl.startsWith('https://') && interviewVideoUrl.includes('s3');
    
    let url;
    if (isS3Url) {
      // S3 URL인 경우 백엔드 프록시를 통해 다운로드
      url = `http://localhost:8081/api/files/s3/download?s3Url=${encodeURIComponent(interviewVideoUrl)}`;
    } else {
      // 로컬 파일인 경우 기존 방식 사용
      const filename = interviewVideoUrl.split('/').pop(); // 예: "video.mp4"
      url = `http://localhost:8081/api/files/download/${filename}`;
    }

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('면접 영상 다운로드 실패');
        return res.blob();
      })
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        setVideoBlobUrl(blobUrl);
      })
      .catch(err => {
        console.error("🎥 면접 영상 fetch 오류:", err);
        setVideoBlobUrl(null);
      });

    return () => {
      if (videoBlobUrl) URL.revokeObjectURL(videoBlobUrl);
    };
  }, [interviewVideoUrl]);



  useEffect(() => {
    if (!isOpen) return;
    const updateWidth = () => {
      if (containerRef.current) {
        console.log("📐 containerRef offsetWidth:", containerRef.current.offsetWidth);
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    window.addEventListener('resize', updateWidth);
    updateWidth();

    return () => window.removeEventListener('resize', updateWidth);
  }, [isOpen]);

  const prev = () => setCurrentIdx(idx => (idx === 0 ? numPages - 1 : idx - 1));
  const next = () => setCurrentIdx(idx => (idx === numPages - 1 ? 0 : idx + 1));
  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

  // 면접초대 버튼 클릭시
  const handleInterviewInvitation = async () => {
    if (!jobCandidateId) {
      alert('후보자 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    const apiUrl = `http://localhost:8081/api/progress/${jobCandidateId}/update-stage-2p`;
    console.log('면접초대 API 호출 URL:', apiUrl);
    console.log('jobCandidateId:', jobCandidateId);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('API 응답 상태:', response.status);
      console.log('API 응답 헤더:', response.headers);

      if (response.ok) {
        alert('면접 초대가 성공적으로 처리되었습니다!');
        // 로컬 상태 업데이트: 2y -> 2p로 변경
        setLocalStage('2p');
      } else {
        const errorText = await response.text();
        console.error('API 오류 응답:', errorText);
        alert(`면접 초대 처리 실패: ${errorText}`);
      }
    } catch (error) {
      console.error('면접 초대 API 호출 오류:', error);
      alert('면접 초대 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 닫기버튼 클릭시
  const handleClose = () => {
    // 아코디언 닫기
    setPortfolioPreviewOpen(false);
    setPortfolioAnalysisOpen(false);
    setInterviewVideoOpen(false);
    setInterviewAnalysisOpen(false);

    // pdf관련 초기화
    setZoom(1.2);
    setCurrentIdx(0);
    setContainerWidth(0);
    setNumPages(null);

    // 후보자 관련 데이터 초기화
    setInvitationTimes([]);
    setPortfolioDate(null);
    setInterviewSchedule(null);
    setPortfolioAnalysis(null);
    setInterviewVideoUrl(null);
    setInterviewAnalysis(null);

    // 최종 닫기
    onClose();
  };

  if (!isOpen || !candidate) return null;

  // 날짜 포맷 함수 (연. 월. 일. 오전/오후 시:분:초)
  function formatKoreanDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    const isPM = hour >= 12;
    const ampm = isPM ? '오후' : '오전';
    let hour12 = hour % 12;
    if (hour12 === 0) hour12 = 12;
    return `${year}. ${month}. ${day}. ${ampm} ${hour12}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleClose}>
      <div
        ref={modalRef}
        className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 w-[85%] max-w-[1200px] max-h-[85%] relative overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            후보자 상세 정보
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            ×
          </button>
        </div>

        {/* 상단 배너형 정보 */}
        <div className="w-full mb-4 py-2 px-4 bg-gradient-to-r from-amber-500 to-amber-500 text-white rounded-xl shadow flex justify-between items-center">
          <span className="flex items-center text-base font-semibold">
            <span className="mr-2">👤</span>{candidate.githubLogin}
          </span>
          <span className="flex items-center text-base font-semibold">
            <span className="mr-2">✉️</span>{candidate.candidateEmail}
          </span>
        </div>

        {/* 기본 정보 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 w-full">
          {/* 분석 점수 카드 */}
          <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-4 rounded-2xl shadow-xl flex flex-col items-center justify-center">
            <span className="text-3xl mb-1">🏆</span>
            <span className="text-base font-bold text-white">분석 점수</span>
            <span className="text-2xl font-extrabold text-white mt-1">{candidate.analysisScore ?? 0}</span>
            <span className="text-xs text-emerald-100">/ 100</span>
          </div>
          {/* 메일 발송 시각 카드 */}
          { ["2n", "2p", "2y", "3n", "3y", "4n", "4y"].includes(localStage) && (
            <div className="bg-gradient-to-br from-orange-400 to-red-400 p-4 rounded-2xl shadow-xl flex flex-col items-center justify-center">
              <span className="text-3xl mb-1">✉️</span>
              <span className="text-base font-bold text-white">메일 발송 시각</span>
              <span className="text-sm font-medium text-white mt-1">{formatKoreanDateTime(invitationTimes)}</span>
            </div>
          )}
          {/* 포트폴리오 제출 카드 */}
          { ["2y","2p", "3n", "3y", "4n", "4y"].includes(localStage) && (
            <div className="bg-gradient-to-br from-cyan-500 to-blue-400 p-4 rounded-2xl shadow-xl flex flex-col items-center justify-center">
              <span className="text-3xl mb-1">📁</span>
              <span className="text-base font-bold text-white">포트폴리오 제출 시각</span>
              <span className="text-sm font-medium text-white mt-1">{formatKoreanDateTime(portfolioDate)}</span>
            </div>
          )}
          {/* 면접 일정 카드 */}
          { ["3n", "3y", "4n", "4y"].includes(localStage) && (
            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-4 rounded-2xl shadow-xl flex flex-col items-center justify-center">
              <span className="text-3xl mb-1">🎤</span>
              <span className="text-base font-bold text-white">면접 일정</span>
              <span className="text-sm font-medium text-white mt-1">{formatKoreanDateTime(interviewSchedule?.aiInterviewScheduledTime)}</span>
            </div>
          )}
          {/* 면접 여부 카드 */}
          { ["3y", "4n", "4y"].includes(localStage) && (
            <div className="bg-gradient-to-br from-yellow-400 to-amber-400 p-4 rounded-2xl shadow-xl flex flex-col items-center justify-center">
              <span className="text-3xl mb-1">📝</span>
              <span className="text-base font-bold text-white">면접 여부</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium mt-1 ${interviewSchedule?.status === 'done' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{interviewSchedule?.status === 'done' ? "완료" : "예정"}</span>
            </div>
          )}
          {/* 합격 여부 카드 */}
          { ["4n", "4y"].includes(localStage) && (
            <div className="bg-gradient-to-br from-emerald-600 to-green-500 p-4 rounded-2xl shadow-xl flex flex-col items-center justify-center">
              <span className="text-3xl mb-1">🥇</span>
              <span className="text-base font-bold text-white">합격 여부</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium mt-1 ${candidate.jobCandCurrStage === "4y" ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{candidate.jobCandCurrStage === "4y" ? "합격" : "불합격"}</span>
            </div>
          )}
        </div>
          
        <div className="mt-10">
        {["2y", "2p", "3n", "3y", "4n", "4y"].includes(localStage) && (
          <>
            {/* 📄 포트폴리오 미리보기 */}
            <Accordion
              title="📄 포트폴리오 미리보기"
              open={portfolioPreviewOpen}
              setOpen={setPortfolioPreviewOpen}
            >
              {portfolioAnalysis && (
                <div className="mb-2 text-center text-lg font-bold text-purple-700">
                  포트폴리오 분석 점수: {portfolioAnalysis.analysisScore} / 100
                </div>
              )}
              <div className="relative w-full h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-inner border border-gray-200">
                {/* 상단 컨트롤 바 */}
                <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-gray-200 flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600">확대/축소</span>
                  <button 
                    onClick={() => setZoom(z => Math.min(z + 0.1, 3))}
                    className="w-8 h-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center justify-center transition-colors duration-200 font-bold"
                  >
                    ＋
                  </button>
                  <button 
                    onClick={() => setZoom(z => Math.max(z - 0.1, 0.2))}
                    className="w-8 h-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center justify-center transition-colors duration-200 font-bold"
                  >
                    －
                  </button>
                  <span className="text-sm font-medium text-gray-600 ml-2">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>

                {/* 페이지 정보 */}
                <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-600">
                    페이지 {currentIdx + 1} / {numPages || '?'}
                  </span>
                </div>

                {/* 왼쪽 버튼 */}
                <button
                  onClick={prev}
                  className="absolute left-4 top-1/2 z-10 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-emerald-600 text-2xl rounded-full w-12 h-12 shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 transform hover:scale-110"
                >
                  ‹
                </button>

                <div ref={containerRef} className="flex justify-center items-center overflow-auto h-full p-4">
                  {pdfBlobUrl ? (
                    <Document
                      file={pdfBlobUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={(err) => console.error("PDF 로딩 오류:", err)}
                    >
                      <Page
                        pageNumber={currentIdx + 1}
                        height={400 * zoom}
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                      />
                    </Document>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg font-medium">포트폴리오를 불러오는 중...</p>
                    </div>
                  )}
                </div>

                {/* 오른쪽 버튼 */}
                <button
                  onClick={next}
                  className="absolute right-4 top-1/2 z-10 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-emerald-600 text-2xl rounded-full w-12 h-12 shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 transform hover:scale-110"
                >
                  ›
                </button>
              </div>
            </Accordion>

            {/* 📁 포트폴리오 분석 결과 */}
            <Accordion
              title="📁 포트폴리오 분석 결과"
              open={portfolioAnalysisOpen}
              setOpen={setPortfolioAnalysisOpen}
            >
              {portfolioAnalysis ? (
                <div className="space-y-6">
                  {/* 점수 카드 */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-200 shadow-sm">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
                      <h4 className="font-semibold text-emerald-800 text-lg">분석 점수</h4>
                    </div>
                    <div className="flex items-center">
                      <span className="text-3xl font-bold text-emerald-600 mr-2">{portfolioAnalysis.analysisScore}</span>
                      <span className="text-sm text-gray-500">/ 100</span>
                    </div>
                  </div>

                  {/* 분석 내용 카드 */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200 shadow-sm">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <h4 className="font-semibold text-blue-800 text-lg">상세 분석</h4>
                    </div>
                    <div className="bg-white/70 p-4 rounded-xl border border-blue-100">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{portfolioAnalysis.analysisData}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium">분석 결과가 없습니다.</p>
                  <p className="text-sm text-gray-400 mt-1">포트폴리오 분석이 진행되지 않았습니다.</p>
                </div>
              )}
            </Accordion>

            {/* 🎯 매칭 정보 */}
            <Accordion
              title="🎯 매칭 정보"
              open={matchingInfoOpen}
              setOpen={setMatchingInfoOpen}
            >
              {candidate?.candPortfolioId ? (
                portfolioMatches && portfolioMatches.length > 0 ? (
                  <div className="space-y-6">
                    {portfolioMatches.map(match => (
                      <div key={match.matchId} className="p-5 rounded-2xl border bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow">
                        <div className="flex items-center mb-2">
                          <span className="font-bold text-lg text-blue-700 mr-2">매칭 점수</span>
                          <span className="text-2xl font-black text-blue-800">{match.matchingScore}</span>
                          <span className="text-sm text-gray-500 ml-1">/ 100</span>
                        </div>
                        <div className="text-gray-700 whitespace-pre-wrap mb-2">
                          {match.matchingReason}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          매칭일: {match.matchCreatedAt ? new Date(match.matchCreatedAt).toLocaleString('ko-KR') : '-'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium">매칭 정보가 없습니다.</p>
                    <p className="text-sm text-gray-400 mt-1">AI 매칭이 진행되지 않았습니다.</p>
                  </div>
                )
              ) : null}
            </Accordion>
          </>
        )}

        {["3y", "4n", "4y"].includes(localStage) && (
          <>
            {/* 🎥 면접 영상 */}
            <Accordion
              title="🎥 면접 영상"
              open={interviewVideoOpen}
              setOpen={setInterviewVideoOpen}
            >
              {videoBlobUrl ? (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 shadow-inner">
                  <div className="relative">
                    <video
                      src={videoBlobUrl}
                      controls
                      className="w-full h-[400px] object-contain rounded-xl shadow-lg"
                    />
                    <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                      면접 영상
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg font-medium">면접 영상이 없습니다.</p>
                  <p className="text-sm text-gray-400 mt-1">면접 영상이 아직 업로드되지 않았습니다.</p>
                </div>
              )}
            </Accordion>



            {/* 🧠 면접 분석 결과 */}
            <Accordion
              title="🧠 면접 분석 결과"
              open={interviewAnalysisOpen}
              setOpen={setInterviewAnalysisOpen}
            >
              {interviewAnalysis ? (
                <div className="space-y-6">
                  {/* 점수 카드 */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200 shadow-sm">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                      <h4 className="font-semibold text-purple-800 text-lg">면접 점수</h4>
                    </div>
                    <div className="flex items-center">
                      <span className="text-3xl font-bold text-purple-600 mr-2">{interviewAnalysis.analysisScore}</span>
                      <span className="text-sm text-gray-500">/ 100</span>
                    </div>
                  </div>

                  {/* 분석 내용 카드 */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-200 shadow-sm">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                      <h4 className="font-semibold text-indigo-800 text-lg">면접 분석</h4>
                    </div>
                    <div className="bg-white/70 p-4 rounded-xl border border-indigo-100">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{interviewAnalysis.analysisData}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p className="text-lg font-medium">분석 결과가 없습니다.</p>
                  <p className="text-sm text-gray-400 mt-1">면접 분석이 진행되지 않았습니다.</p>
                </div>
              )}
            </Accordion>
          </>
        )}
      </div>
              

        <div className="mt-8 flex justify-end gap-3">
          {/* 면접 요청 버튼 - 2y 단계에서만 표시 */}
          {["2y"].includes(localStage) && (
            <button
              onClick={handleInterviewInvitation}
              className={`px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 ${
                matchingInfo && matchingInfo.hasMatch 
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
              }`}
            >
              {matchingInfo && matchingInfo.hasMatch ? "매칭 후보 면접 요청" : "면접초대"}
            </button>
          )}
          
          <button
            onClick={handleClose}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
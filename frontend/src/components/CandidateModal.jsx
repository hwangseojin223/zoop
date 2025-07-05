import React, { useEffect, useRef, useState } from 'react';import { Document, Page, pdfjs } from 'react-pdf';
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

  const [videoBlobUrl, setVideoBlobUrl] = useState(null);




  /** 아코디언 */
  const Accordion = ({ title, open, setOpen, children }) => (
    <div className="mb-4 border rounded">
      <button
        onClick={() => setOpen(prev => !prev)}
        className="w-full text-left px-4 py-2 bg-emerald-100 hover:bg-emerald-200 font-semibold text-emerald-800"
      >
        {title}
      </button>

      {open && <div className="p-4 bg-white">{children}</div>}

    </div>
  );


  // 모달이 열릴 때 stage에 따라 API 호출
  useEffect(() => {
    if (!isOpen || !candidate) return;

    const stage = candidate.jobCandCurrStage;
    const jobCandidateId = candidate.jobCandidateId;
    const githubLogin = candidate.githubLogin;

    // invitationSentDate
    if (["2n", "2y", "3n", "3y", "4n", "4y"].includes(stage)) {
      fetch(`http://localhost:8081/api/invitations/${postId}/${githubLogin}/sent-times`)
        .then(res => res.json())
        // .then(data => setInvitationTimes(data))
        .then(data => setInvitationTimes(data[0].invitationSentDate))
        .catch(() => setInvitationTimes([]));
    }

    // portfolioSubmissionDate 
    if (["2y", "3n", "3y", "4n", "4y"].includes(stage)) {
      fetch(`http://localhost:8081/api/portfolios/${jobCandidateId}/submission-date`)
        .then(res => res.json())
        .then(data => setPortfolioDate(data.portfolioSubmissionDate)) // or .portfolioSubmissionDate
        .catch(() => setPortfolioDate(null));
    }

    if (["3n", "3y", "4n", "4y"].includes(stage)) {
      fetch(`http://localhost:8081/api/interviews/${jobCandidateId}/schedule`)
        .then(res => res.json())
        .then(data => setInterviewSchedule(data))
        .catch(() => setInterviewSchedule(null));
    }

    // 포트폴리오 분석
    if (["2y", "3n", "3y", "4n", "4y"].includes(stage)) {
      fetch(`http://localhost:8081/api/analysis/${jobCandidateId}/portfolio`)
        .then(res => res.json())
        .then(setPortfolioAnalysis)
        .catch(() => setPortfolioAnalysis(null));
    }

    
    // 면접 영상
    if (["3y", "4n", "4y"].includes(stage)) {
      fetch(`http://localhost:8081/api/interviews/${jobCandidateId}/video`)
        .then(res => res.json())
        .then(data => setInterviewVideoUrl(data.videoUrl))
        .catch(() => setInterviewVideoUrl(null));

      // 면접 분석
      fetch(`http://localhost:8081/api/analysis/${jobCandidateId}/interview`)
        .then(res => res.json())
        .then(setInterviewAnalysis)
        .catch(() => setInterviewAnalysis(null));
    }
    
  }, [isOpen, candidate]);

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
    if (!candidate?.filePath) return;

    const filename = candidate.filePath.split('/').pop();
    const url = `http://localhost:8081/api/files/download/${filename}`;

    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        setPdfBlobUrl(blobUrl);
      })
      .catch(err => {
        console.error("PDF fetch 오류:", err);
        setPdfBlobUrl(null);
      });

    // cleanup
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [candidate?.filePath]);

  
  /** 면접영상을 불러오기 위한 useState */
  useEffect(() => {
    if (!interviewVideoUrl) return;

    const filename = interviewVideoUrl.split('/').pop(); // 예: "video.mp4"
    const url = `http://localhost:8081/api/files/download/${filename}`;

    fetch(url)
      .then(res => res.blob())
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleClose}>
      <div
        ref={modalRef}
        className="bg-emerald-50 p-10 rounded-2xl shadow-lg border w-[80%] max-w-[1100px] max-h-[80%] relative overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-bold text-emerald-700 mb-6 border-b pb-3">회신자 상세 정보</h3>

        <div className="grid grid-cols-2 gap-4 mb-10 text-sm">
          <div><strong>GitHub:</strong> {candidate.githubLogin}</div>
          <div><strong>이메일:</strong> {candidate.candidateEmail}</div>
          <div><strong>점수:</strong> {candidate.githubAnalysisScore}</div>

          {["2n", "2y", "3n", "3y", "4n", "4y"].includes(candidate.jobCandCurrStage) && (
            // <div><strong>메일 발송 시각:</strong> {invitationTimes.map((t, idx) => (
            //   <div key={idx}>{t.invitationSentDate}</div>
            // ))}</div>
            <div><strong>메일 발송 시각:</strong> 
              <div>{invitationTimes}</div>
            </div>
          )}

          {["2y", "3n", "3y", "4n", "4y"].includes(candidate.jobCandCurrStage) && (
            <div><strong>포트폴리오 제출:</strong> {portfolioDate && new Date(portfolioDate).toLocaleString()}</div>
          )}

          {["3n", "3y", "4n", "4y"].includes(candidate.jobCandCurrStage) && (
            <div><strong>면접 일정:</strong> {interviewSchedule?.aiInterviewScheduledTime}</div>
          )}

          {["3y", "4n", "4y"].includes(candidate.jobCandCurrStage) && (
            <div><strong>면접 여부:</strong> 
              {interviewSchedule?.status === 'done' ? "완료" : "예정"}
            </div>
          )}

          {["4n", "4y"].includes(candidate.jobCandCurrStage) && (
            <div><strong>합격 여부:</strong> 
              {candidate.jobCandCurrStage === "4y" ? "합격" : "불합격"}
            </div>
          )}
        </div>
          
        <div className="mt-10">
        {["2y", "3n", "3y", "4n", "4y"].includes(candidate.jobCandCurrStage) && (
          <>
            {/* 📄 포트폴리오 미리보기 */}
            <Accordion
              title="📄 포트폴리오 미리보기"
              open={portfolioPreviewOpen}
              setOpen={setPortfolioPreviewOpen}
            >
              <div className="relative w-full h-[500px] border rounded bg-gray-50 shadow-inner">
                {/* 확대/축소 버튼 */}
                <div className="absolute top-2 right-2 z-10 bg-white rounded px-2 py-1 shadow flex space-x-2">
                  <button onClick={() => setZoom(z => Math.min(z + 0.1, 3))}>＋</button>
                  <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.2))}>－</button>
                </div>

                {/* 왼쪽버튼 */}
                <button
                  onClick={prev}
                  className="absolute left-2 top-1/2 z-10 bg-white text-xl rounded-full px-2 py-1 shadow border"
                >
                  ‹
                </button>

                <div ref={containerRef} className="flex justify-center items-center overflow-auto h-full">
                  {pdfBlobUrl && (
                    <Document
                      file={pdfBlobUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={(err) => console.error("PDF 로딩 오류:", err)}
                    >
                      <Page
                        pageNumber={currentIdx + 1}
                        height={400 * zoom}  // ✅ 높이에 맞춰서 렌더링
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                      />
                    </Document>
                  )}
                </div>

                {/* 오른쪽버튼 */}
                <button
                  onClick={next}
                  className="absolute right-2 top-1/2 z-10 bg-white text-xl rounded-full px-2 py-1 shadow border"
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
                <div className="text-sm space-y-2">
                  <p><strong>점수:</strong> {portfolioAnalysis.analysisScore}</p>
                  <p><strong>내용:</strong> {portfolioAnalysis.analysisData}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">분석 결과가 없습니다.</p>
              )}
            </Accordion>
          </>
        )}

        {["3y", "4n", "4y"].includes(candidate.jobCandCurrStage) && (
          <>
            {/* 🎥 면접 영상 */}
            <Accordion
              title="🎥 면접 영상"
              open={interviewVideoOpen}
              setOpen={setInterviewVideoOpen}
            >
              {videoBlobUrl ? (
                <video
                  src={videoBlobUrl}
                  controls
                  className="w-full h-[400px] object-contain rounded"
                />
              ) : (
                <p className="text-sm text-gray-500">면접 영상이 없습니다.</p>
              )}
            </Accordion>



            {/* 🧠 면접 분석 결과 */}
            <Accordion
              title="🧠 면접 분석 결과"
              open={interviewAnalysisOpen}
              setOpen={setInterviewAnalysisOpen}
            >
              {interviewAnalysis ? (
                <div className="text-sm space-y-2">
                  <p><strong>점수:</strong> {interviewAnalysis.analysisScore}</p>
                  <p><strong>내용:</strong> {interviewAnalysis.analysisData}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">분석 결과가 없습니다.</p>
              )}
            </Accordion>
          </>
        )}
      </div>
              

        <div className="mt-8 text-right">
          <button
            onClick={handleClose}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
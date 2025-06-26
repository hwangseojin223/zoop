import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';

export default function StatePage() {
  const { postId } = useParams();
  const [searchResults, setSearchResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [detailTarget, setDetailTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [tab, setTab] = useState('전체');
  const resultsPerPage = 6;

  useEffect(() => {
    fetch(`http://localhost:8081/api/github-search/${postId}/states`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(setSearchResults)
      .catch((err) => {
        console.error('❌ 데이터 불러오기 실패:', err);
        setSearchResults([]);
      });
  }, [postId]);

  const handleCheck = (login) => {
    setSelected((prev) =>
      prev.includes(login) ? prev.filter((id) => id !== login) : [...prev, login]
    );
  };

  const handleSendEmail = () => {
    console.log('선택된 유저에게 이메일 전송:', selected);
  };

  const getStageLabel = (code) => {
    switch (code) {
      case '1n': return '필터링';
      case '2n': return '메일발송';
      case '2y': return '회신';
      case '3n': return '면접 예정자';
      case '3y': return '면접 완료자';
      case '4n': return '불합격';
      case '4y': return '합격';
      default: return '필터링';
    }
  };


  const filteredResults = searchResults.filter((r) => {
    if (tab === '전체') return true;
    if (tab === '회신자') return r.jobCandCurrStage === '2y';
    if (tab === '면접 예정자') return r.jobCandCurrStage === '3n';
    if (tab === '면접 완료자') {
      return ['3y', '4n', '4y'].includes(r.jobCandCurrStage);
    }
    return true;
  });

  const totalPages = Math.ceil(filteredResults.length / resultsPerPage);
  const currentResults = filteredResults.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const tabs = ['전체', '회신자', '면접 예정자', '면접 완료자'];

  return (
    <div className="min-h-screen bg-emerald-50 pt-20">
      <Navbar />
      <div className="p-10 font-sans">
        <h1 className="text-3xl font-bold mb-8 text-emerald-700">📊 후보자 상태</h1>

        {/* 탭 UI */}
        <div className="flex space-x-4 mb-8">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setCurrentPage(1); setSelected([]); }}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-150 border-2 ${
                tab === t
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-emerald-700 border-green-600 hover:bg-emerald-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentResults.map((r, i) => (
            <div key={i} className="relative bg-white border border-gray-200 rounded-xl shadow p-6 flex flex-col justify-between">
              {tab === '전체' && (
                <div className="absolute top-3 right-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(r.githubLogin)}
                    onChange={() => handleCheck(r.githubLogin)}
                  />
                </div>
              )}
              <h3 className="text-xl font-semibold text-gray-800 mb-2">👤 {r.githubLogin}</h3>

              <div className="text-sm text-gray-700 flex flex-col gap-2">
                <div>
                  <span className="font-semibold text-emerald-700">점수:</span> {r.githubAnalysisScore}
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-emerald-700">분석:</span>
                  <div className="text-xs text-gray-600 mt-1 line-clamp-3">
                    {r.analysisData}
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-emerald-700">상태:</span> {getStageLabel(r.jobCandCurrStage)}
                </div>

              </div>

              <button
                onClick={() => setDetailTarget(r)}
                className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-1.5 px-4 rounded-md text-sm self-end"
              >
                상세보기
              </button>
            </div>
          ))}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-4 text-sm text-gray-700">
            <button onClick={prevPage} disabled={currentPage === 1} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">
              ◀ 이전
            </button>
            <span className="px-4 py-1">{currentPage} / {totalPages}</span>
            <button onClick={nextPage} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">
              다음 ▶
            </button>
          </div>
        )}

        {/* 이메일 보내기 버튼 */}
        {tab === '전체' && selected.length > 0 && (
          <div className="mt-8 text-right">
            <button
              onClick={handleSendEmail}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-md"
            >
              ✉ 이메일 보내기 ({selected.length}명)
            </button>
          </div>
        )}

        {/* 상세보기 모달 */}
        {detailTarget && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center"
            onClick={() => setDetailTarget(null)}
          >
            <div
              className="bg-white rounded-xl p-8 w-[600px] max-h-[80vh] overflow-y-auto shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-emerald-700 mb-4">📋 상세 분석</h2>
              <p className="mb-2"><strong>GitHub 로그인:</strong> {detailTarget.githubLogin}</p>
              <p className="mb-2"><strong>이메일:</strong> {detailTarget.candidateEmail}</p>
              <p className="mb-2"><strong>점수:</strong> {detailTarget.githubAnalysisScore}</p>
              <p className="mb-2"><strong>상태:</strong> {detailTarget.jobCandCurrStage || '없음'}</p>
              <div className="mt-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">🧠 분석 내용:</h4>
                <pre className="text-sm whitespace-pre-wrap text-gray-700 bg-gray-100 p-4 rounded">
                  {detailTarget.analysisData}
                </pre>
              </div>
              <div className="mt-6 text-right">
                <button
                  onClick={() => setDetailTarget(null)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
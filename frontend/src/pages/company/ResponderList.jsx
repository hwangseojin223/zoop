import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { useParams } from 'react-router-dom';

export default function ResponderList() {
  const { postId } = useParams();
  const [responder, setResponder] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedResponder, setSelectedResponder] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);

  const portfolioImages = [
    'https://picsum.photos/800/900?random=1',
    'https://picsum.photos/800/900?random=2',
    'https://picsum.photos/800/900?random=3',
  ];

  useEffect(() => {
    fetch(`http://localhost:8081/api/responder/${postId}`)
      .then(res => res.json())
      .then(setResponder)
      .catch(err => console.error('❌ 후보자 목록 오류:', err));
  }, [postId]);

  const handleDetail = (r) => {
    setSelectedResponder(r);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedResponder(null);
  };

  const prev = () => {
    setCurrentIdx((idx) => (idx === 0 ? portfolioImages.length - 1 : idx - 1));
  };

  const next = () => {
    setCurrentIdx((idx) => (idx === portfolioImages.length - 1 ? 0 : idx + 1));
  };

  return (
    <div>
      <Navbar />
      <div className="px-12 pt-28 pb-12">
        <h2 className="text-2xl font-bold mb-8">
          🔍 {postId}번 공고 회신자 목록
        </h2>

        {responder.length === 0 ? (
          <p>회신자가 없습니다.</p>
        ) : (
          <ul className="grid grid-cols-4 gap-6">
            {responder.map((r, i) => (
              <li
                key={i}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="mb-3"><strong>이름 :</strong> <span>{r.name}</span></div>
                <div className="mb-3"><strong>이메일 :</strong> <span>{r.email}</span></div>
                <div className="mb-3"><strong>지역 :</strong> <span>{r.location}</span></div>
                <div className="mb-3"><strong>언어 :</strong> <span>{r.languages}</span></div>
                <div className="mb-3"><strong>점수 :</strong> <span>{r.score}</span></div>
                <div className="mb-3"><strong>분석요약 :</strong> <span>{r.portfolioAnalysis}</span></div>
                <button
                  onClick={() => handleDetail(r)}
                  className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                >
                  자세히보기
                </button>
              </li>
            ))}
          </ul>
        )}

        {isModalOpen && selectedResponder && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={closeModal}
          >
            <div
              className="bg-white p-8 rounded-lg w-[1100px] max-w-[2000px] max-h-[80%] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-4">회신자 상세 정보</h3>
              <div className="grid grid-cols-2 gap-4 mb-6 ml-12 w-[60%]">
                <p><strong>이름:</strong> {selectedResponder.name}</p>
                <p><strong>이메일:</strong> {selectedResponder.email}</p>
                <p><strong>지역:</strong> {selectedResponder.location}</p>
                <p><strong>언어:</strong> {selectedResponder.languages}</p>
                <p><strong>점수:</strong> {selectedResponder.score}</p>
                <p><strong>분석:</strong> {selectedResponder.portfolioAnalysis}</p>
              </div>

              <h4 className="text-lg font-semibold mb-2">포트폴리오 미리보기</h4>
              <div className="relative w-[800px] h-[600px] mx-auto overflow-hidden">
                <button
                  onClick={(e) => { prev(); e.preventDefault(); }}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white px-2 py-1 z-10 hover:bg-opacity-70"
                >‹</button>
                <img
                  src={portfolioImages[currentIdx]}
                  alt={`포트폴리오 ${currentIdx + 1}`}
                  className="w-full h-full object-cover transition-transform"
                />
                <button
                  onClick={(e) => { next(); e.preventDefault(); }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white px-2 py-1 z-10 hover:bg-opacity-70"
                >›</button>
              </div>

              <button
                onClick={closeModal}
                className="mt-6 px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600"
              >닫기</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

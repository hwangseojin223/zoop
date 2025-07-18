import React, { useState, useEffect } from 'react';

const InterviewPreparationModal = ({ isOpen, onClose, postId, candidateId }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 면접 예상질문 API 호출
  const fetchInterviewQuestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `http://localhost:8081/api/interview-questions/generate/${postId}/${candidateId}`,
        { method: 'GET' }
      );
      
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      } else {
        throw new Error('면접 예상질문을 가져오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('면접 예상질문 API 오류:', err);
      setError(err.message);
      // 기본 질문 제공
      setQuestions([
        '자기소개를 부탁드립니다.',
        '이 회사에 지원한 이유는 무엇인가요?',
        '본인의 강점과 약점을 말씀해주세요.',
        '5년 후 본인의 모습은 어떨 것 같나요?',
        '이전 프로젝트에서 가장 어려웠던 점은 무엇인가요?',
        '팀워크 경험에 대해 말씀해주세요.',
        '새로운 기술을 학습하는 방법은 무엇인가요?',
        '업무에서 우선순위를 정하는 기준은 무엇인가요?',
        '스트레스를 받을 때 어떻게 해결하나요?',
        '마지막으로 궁금한 점이 있다면 질문해주세요.'
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 모달이 열릴 때 질문 가져오기
  useEffect(() => {
    if (isOpen && postId && candidateId) {
      fetchInterviewQuestions();
    }
  }, [isOpen, postId, candidateId]);

  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* 모달 컨테이너 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
          
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-yellow-500 to-amber-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-20">
                  <span className="text-xl">💡</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">면접 예상질문</h3>
                  <p className="text-yellow-100 text-sm">면접 준비를 위한 맞춤형 질문들</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition-colors"
              >
                <span className="text-lg">×</span>
              </button>
            </div>
          </div>

          {/* 컨텐츠 */}
          <div className="max-h-96 overflow-y-auto px-6 py-4">
            {loading ? (
              // 로딩 상태
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mb-4"></div>
                <p className="text-gray-600 text-center">
                  맞춤형 면접 예상질문을 생성중입니다...<br/>
                  <span className="text-sm text-gray-500">잠시만 기다려주세요.</span>
                </p>
              </div>
            ) : error ? (
              // 에러 상태 (기본 질문 표시)
              <div className="space-y-4">
                <div className="flex items-center space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <span className="text-amber-500">⚠️</span>
                  <p className="text-amber-700 text-sm">
                    맞춤 질문 생성에 실패했습니다. 일반적인 면접 질문을 제공합니다.
                  </p>
                </div>
                <div className="space-y-3">
                  {questions.map((question, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 text-white font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-gray-800 leading-relaxed flex-1">{question}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // 정상 상태
              <div className="space-y-4">
                <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <span className="text-yellow-500">✅</span>
                  <p className="text-yellow-700 text-sm">
                    포지션과 경력에 맞는 맞춤형 질문이 생성되었습니다.
                  </p>
                </div>
                <div className="space-y-3">
                  {questions.map((question, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200 hover:from-yellow-100 hover:to-amber-100 transition-all duration-200"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-gray-800 leading-relaxed flex-1">{question}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 푸터 */}
          <div className="bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>💪</span>
                <span>면접 준비 화이팅!</span>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 px-6 py-2 text-sm font-medium text-white hover:from-yellow-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPreparationModal; 
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SEO from '../../components/SEO';

// InterviewSession.jsx: 2-column layout (left: question/timer, right: video), auto think/answer phase with timer and recording

function InterviewSession() {
  const { scheduleId } = useParams();
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const navigate = useNavigate();

  // 질문 상태 추가
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const question = questions[currentQuestionIdx];
  const [phase, setPhase] = useState('countdown'); // 'countdown' | 'ready' | 'think' | 'answer' | 'done'
  const [timer, setTimer] = useState(5); // 시작 카운트다운 5초
  const [completed, setCompleted] = useState(false);
  const [thinkTime, setThinkTime] = useState(2); // 생각 시간 2초 (테스트용)
  const [answerTime, setAnswerTime] = useState(3); // 답변 시간 3초 (테스트용)

  // 질문 가져오기
  useEffect(() => {
    if (!scheduleId) return;
    
    const scheduleIdNum = parseInt(scheduleId);
    if (isNaN(scheduleIdNum)) {
      setError('유효하지 않은 면접 일정 ID입니다.');
      setLoading(false);
      return;
    }
    
    fetch(`http://localhost:8081/api/interview-videos/questions/${scheduleIdNum}`)
      .then(res => {
        if (!res.ok) throw new Error('질문을 불러오지 못했습니다');
        return res.json();
      })
      .then(data => {
        console.log('[InterviewSession] 질문 로드 성공:', data);
        setQuestions(data);
        setLoading(false);
      })
      .catch(e => {
        console.error('[InterviewSession] 질문 로드 실패:', e);
        setError(e.message);
        setLoading(false);
        // 기본 질문으로 fallback
        setQuestions([
          '자기소개를 해주세요.',
          '이 직무에 지원한 이유는 무엇인가요?',
          '가장 기억에 남는 프로젝트에 대해 설명해주세요.'
        ]);
      });
  }, [scheduleId]);

  useEffect(() => {
    async function startStream() {
      const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(userStream);
      if (videoRef.current) {
        videoRef.current.srcObject = userStream;
      }
    }
    startStream();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
    // eslint-disable-next-line
  }, []);

  // 타이머 제어 (사용자가 시작할 때만 작동)
  useEffect(() => {
    if (completed || questions.length === 0) return;
    
    let t;
    
    // 카운트다운 단계
    if (phase === 'countdown' && timer > 0) {
      t = setTimeout(() => setTimer(timer - 1), 1000);
    } else if (phase === 'countdown' && timer === 0) {
      // 카운트다운 완료 시 바로 첫 질문의 생각 시간 시작
      setPhase('think');
      setTimer(thinkTime);
    }
    
    // 생각/답변 단계
    if (phase === 'think' && timer > 0) {
      t = setTimeout(() => setTimer(timer - 1), 1000);
    } else if (phase === 'think' && timer === 0) {
      // 생각 시간 종료 시 자동으로 답변 단계로
      setPhase('answer');
      setTimer(answerTime);
    } else if (phase === 'answer' && timer > 0) {
      t = setTimeout(() => setTimer(timer - 1), 1000);
    } else if (phase === 'answer' && timer === 0) {
      // 답변 시간 종료 시 자동으로 녹화 종료
      stopRecording();
    }
    
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [phase, timer, completed, questions.length, thinkTime, answerTime]);

  // 준비 완료 후 생각 시간 시작
  const startThinking = () => {
    setPhase('think');
    setTimer(thinkTime);
  };

  // 생각 시간 중 답변 시작 (사용자가 원할 때)
  const startAnswering = () => {
    setPhase('answer');
    setTimer(answerTime);
    startRecording();
  };

  // 답변 시간 중 수동으로 답변 종료 (사용자가 원할 때)
  const finishAnswering = () => {
    stopRecording();
  };

  const startRecording = () => {
    if (!stream) return;
    const mediaRecorder = new window.MediaRecorder(stream, { mimeType: 'video/webm' });
    let chunks = [];
    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      await uploadVideo(blob, currentQuestionIdx + 1, question);
      // 다음 질문으로 이동 또는 종료
      if (currentQuestionIdx < questions.length - 1) {
        setCurrentQuestionIdx(currentQuestionIdx + 1);
        setPhase('think'); // 바로 생각 시간 시작
        setTimer(thinkTime);
      } else {
        setCompleted(true);
        setPhase('done');
        // 면접 완료 처리
        completeInterview();
        setTimeout(() => {
          alert('모든 면접 질문이 완료되었습니다!');
          navigate('/candidate/dashboard');
        }, 1500);
      }
    };
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const completeInterview = async () => {
    try {
      // scheduleId가 유효한 숫자인지 확인
      const scheduleIdNum = parseInt(scheduleId);
      if (isNaN(scheduleIdNum)) {
        console.error('유효하지 않은 면접 일정 ID입니다:', scheduleId);
        return;
      }
      
      console.log('[InterviewSession] 면접 완료 API 호출 시작: scheduleId=', scheduleIdNum);
      
      // 면접 완료 API 호출
      const response = await fetch(`http://localhost:8081/api/interview-schedules/${scheduleIdNum}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('[InterviewSession] 면접 완료 처리 성공:', result);
      } else {
        console.error('[InterviewSession] 면접 완료 처리 실패:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('[InterviewSession] 에러 응답:', errorText);
      }
    } catch (error) {
      console.error('[InterviewSession] 면접 완료 처리 중 오류:', error);
    }
  };

  const uploadVideo = async (blob, questionNumber, questionContent) => {
    // scheduleId가 유효한 숫자인지 확인
    const scheduleIdNum = parseInt(scheduleId);
    if (isNaN(scheduleIdNum)) {
      console.error('유효하지 않은 면접 일정 ID입니다:', scheduleId);
      return;
    }
    
    const formData = new FormData();
    formData.append('videoFile', blob, `interview_${scheduleIdNum}_q${questionNumber}.webm`);
    formData.append('scheduleId', scheduleIdNum);
    formData.append('questionNumber', questionNumber);
    formData.append('questionContent', questionContent);

    const res = await fetch('http://localhost:8081/api/interview-videos/upload', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      alert('업로드 실패');
    }
  };

  if (completed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#30C59B', fontWeight: 700 }}>
        모든 면접 질문이 완료되었습니다!
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#30C59B', fontWeight: 600 }}>
        면접 질문을 불러오는 중...
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#e53e3e', fontWeight: 600 }}>
        <div style={{ marginBottom: '1rem' }}>면접 질문을 불러올 수 없습니다.</div>
        <div style={{ fontSize: 16, color: '#666', marginBottom: '2rem' }}>{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          style={{ 
            padding: '12px 24px', 
            backgroundColor: '#30C59B', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="interview-session-layout" style={{ display: 'flex', gap: 32, alignItems: 'stretch', justifyContent: 'center', minHeight: '100vh' }}>
      <SEO
        title="AI 면접 진행"
        description="AI 면접을 진행하는 페이지입니다. 질문에 답변하고 녹화를 진행합니다."
        keywords="AI 면접, 면접 진행, 면접 녹화, 면접 질문"
      />
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}
      </style>
      <div
        className="question-area"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#f8f9fa',
          borderRadius: 12,
        }}
      >
        <h2 style={{ color: '#30C59B', marginBottom: 24, textAlign: 'center' }}>면접 질문 {currentQuestionIdx + 1} / {questions.length}</h2>
        
        {/* 진행률 표시 */}
        <div style={{ 
          width: '100%', 
          maxWidth: '400px', 
          height: '8px', 
          backgroundColor: '#e9ecef', 
          borderRadius: '4px', 
          marginBottom: '24px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${((currentQuestionIdx + 1) / questions.length) * 100}%`,
            height: '100%',
            backgroundColor: '#30C59B',
            transition: 'width 0.3s ease'
          }} />
        </div>
        
        <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 32, textAlign: 'center' }}>{question}</div>
        <div style={{ fontSize: 18, marginBottom: 16, textAlign: 'center' }}>
          {phase === 'countdown' ? '면접 시작 카운트다운' : phase === 'ready' ? '준비 완료' : phase === 'think' ? '생각 시간' : '답변 시간'}
        </div>
        
        {/* 타이머 표시 개선 */}
        {phase === 'countdown' && (
          <div style={{ 
            fontSize: 72, 
            fontWeight: 700, 
            color: '#30C59B', 
            marginBottom: 24, 
            textAlign: 'center',
            animation: timer <= 3 ? 'pulse 1s infinite' : 'none'
          }}>
            {timer}
          </div>
        )}
        
        {phase !== 'countdown' && phase !== 'ready' && (
          <div style={{ 
            fontSize: 48, 
            fontWeight: 700, 
            color: timer <= 10 ? '#dc3545' : '#30C59B', 
            marginBottom: 24, 
            textAlign: 'center',
            transition: 'color 0.3s ease'
          }}>
            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
          </div>
        )}
        
        {phase === 'ready' && (
          <div style={{ 
            fontSize: 48, 
            fontWeight: 700, 
            color: '#30C59B', 
            marginBottom: 24, 
            textAlign: 'center' 
          }}>
            준비 완료
          </div>
        )}
        
        {/* 단계별 제어 버튼 */}
        {phase === 'countdown' && (
          <div style={{ color: '#888', textAlign: 'center', marginTop: '16px' }}>
            면접이 곧 시작됩니다...
          </div>
        )}
        
        {phase === 'ready' && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={startThinking}
              style={{
                padding: '12px 24px',
                backgroundColor: '#30C59B',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              생각 시간 시작
            </button>
          </div>
        )}
        
        {phase === 'think' && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={startAnswering}
              style={{
                padding: '12px 24px',
                backgroundColor: '#30C59B',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              답변 시작
            </button>
            {timer < thinkTime && (
              <button 
                onClick={() => setTimer(thinkTime)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                시간 연장
              </button>
            )}
          </div>
        )}
        
        {phase === 'answer' && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={finishAnswering}
              style={{
                padding: '12px 24px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              답변 완료
            </button>
            {timer < answerTime && (
              <button 
                onClick={() => setTimer(answerTime)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                시간 연장
              </button>
            )}
          </div>
        )}
        
        {phase === 'ready' && <div style={{ color: '#888', textAlign: 'center', marginTop: '16px' }}>준비 완료 후 생각 시간을 시작합니다.</div>}
        {phase === 'think' && <div style={{ color: '#888', textAlign: 'center', marginTop: '16px' }}>생각 시간 동안 답변을 준비하세요.</div>}
        {phase === 'answer' && <div style={{ color: '#888', textAlign: 'center', marginTop: '16px' }}>답변을 녹화 중입니다...</div>}
      </div>
      <div
        className="video-area"
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <video ref={videoRef} autoPlay playsInline style={{ width: 480, height: 360, background: '#000', borderRadius: 12, display: 'block' }} />
      </div>
    </div>
  );
}

export default InterviewSession; 
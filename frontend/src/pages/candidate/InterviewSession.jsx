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

  // 질문 배열
  const questions = [
    '자기소개',
    '갈등을 겪고 해결해본 적 있나요?',
    '가장 최근에 진행한 프로젝트에 대해서 설명해주세요'
  ];
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const question = questions[currentQuestionIdx];
  const [phase, setPhase] = useState('think'); // 'think' | 'answer' | 'done'
  const [timer, setTimer] = useState(2); // 생각 시간 2초로 변경
  const [completed, setCompleted] = useState(false);

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

  // 타이머/단계 전환 및 녹화 제어
  useEffect(() => {
    if (completed) return;
    let t;
    if (phase === 'think' && timer > 0) {
      t = setTimeout(() => setTimer(timer - 1), 1000);
    } else if (phase === 'think' && timer === 0) {
      setPhase('answer');
      setTimer(3); // 답변 시간 3초로 변경
      startRecording();
    } else if (phase === 'answer' && timer > 0) {
      t = setTimeout(() => setTimer(timer - 1), 1000);
    } else if (phase === 'answer' && timer === 0) {
      stopRecording();
    }
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [phase, timer, completed]);

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
        setPhase('think');
        setTimer(2);
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
      // 면접 완료 API 호출
      const response = await fetch(`http://localhost:8081/api/interviews/${scheduleId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        console.log('면접 완료 처리 성공');
      } else {
        console.error('면접 완료 처리 실패:', response.status);
      }
    } catch (error) {
      console.error('면접 완료 처리 중 오류:', error);
    }
  };

  const uploadVideo = async (blob, questionNumber, questionContent) => {
    const formData = new FormData();
    formData.append('videoFile', blob, `interview_${scheduleId || Date.now()}_q${questionNumber}.webm`);
    formData.append('scheduleId', scheduleId);
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

  return (
    <div className="interview-session-layout" style={{ display: 'flex', gap: 32, alignItems: 'stretch', justifyContent: 'center', minHeight: '100vh' }}>
      <SEO
        title="AI 면접 진행"
        description="AI 면접을 진행하는 페이지입니다. 질문에 답변하고 녹화를 진행합니다."
        keywords="AI 면접, 면접 진행, 면접 녹화, 면접 질문"
      />
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
        <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 32, textAlign: 'center' }}>{question}</div>
        <div style={{ fontSize: 18, marginBottom: 16, textAlign: 'center' }}>
          {phase === 'think' ? '생각 시간' : '답변 시간'}
        </div>
        <div style={{ fontSize: 48, fontWeight: 700, color: '#30C59B', marginBottom: 24, textAlign: 'center' }}>{timer}초</div>
        {phase === 'think' && <div style={{ color: '#888', textAlign: 'center' }}>생각 시간 동안 답변을 준비하세요.</div>}
        {phase === 'answer' && <div style={{ color: '#888', textAlign: 'center' }}>답변을 녹화 중입니다...</div>}
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
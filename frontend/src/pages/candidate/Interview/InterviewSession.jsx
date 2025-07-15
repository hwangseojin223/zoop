import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// InterviewSession.jsx: 2-column layout (left: question/timer, right: video), auto think/answer phase with timer and recording

const THINK_TIME = 3;
const ANSWER_TIME = 2;

const InterviewSession = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState('think'); // 'think' | 'answer' | 'done'
  const [timer, setTimer] = useState(THINK_TIME);
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // 질문 가져오기
  useEffect(() => {
    if (!scheduleId) return;
    
    // scheduleId가 유효한 숫자인지 확인
    const scheduleIdNum = parseInt(scheduleId);
    if (isNaN(scheduleIdNum)) {
      setError('유효하지 않은 면접 일정 ID입니다.');
      return;
    }
    
    fetch(`/api/interview-videos/questions/${scheduleIdNum}`)
      .then(res => {
        if (!res.ok) throw new Error('질문을 불러오지 못했습니다');
        return res.json();
      })
      .then(data => {
        setQuestions(data);
      })
      .catch(e => setError(e.message));
  }, [scheduleId]);

  // 카메라 프리뷰 연결
  useEffect(() => {
    let isMounted = true;
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (isMounted && videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      })
      .catch((err) => {
        setError('카메라 접근에 실패했습니다: ' + err.message);
      });
    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // phase & timer 관리
  useEffect(() => {
    if (!questions.length || phase === 'done') return;
    if (timer <= 0) {
      if (phase === 'think') {
        setPhase('answer');
        setTimer(ANSWER_TIME);
      } else if (phase === 'answer') {
        setPhase('upload');
      }
      return;
    }
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, phase, questions.length]);

  // answer phase에서만 녹화 시작/종료
  useEffect(() => {
    if (phase === 'answer') {
      if (streamRef.current) {
        const clonedStream = streamRef.current.clone();
        const recorder = new window.MediaRecorder(clonedStream, { mimeType: 'video/webm' });
        recorderRef.current = recorder;
        chunksRef.current = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          uploadVideo(blob);
          clonedStream.getTracks().forEach(track => track.stop());
        };
        recorder.start();
        setRecording(true);
      }
    } else if (phase === 'upload') {
      if (recorderRef.current && recorderRef.current.state === 'recording') {
        recorderRef.current.stop();
        setRecording(false);
      }
    }
    // eslint-disable-next-line
  }, [phase]);

  // 업로드 함수
  const uploadVideo = async (blob) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('videoFile', blob, `interview_${scheduleId}_q${currentIdx + 1}.webm`);
    formData.append('scheduleId', scheduleId);
    formData.append('questionNumber', currentIdx + 1);
    formData.append('questionContent', questions[currentIdx]);
    try {
      const res = await fetch('/api/interview-videos/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('업로드 실패');
      // 다음 질문으로
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(idx => idx + 1);
        setPhase('think');
        setTimer(THINK_TIME);
      } else {
        setPhase('done');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  // 면접 완료 후 2초 뒤 자동 이동
  useEffect(() => {
    if (phase === 'done') {
      const timeout = setTimeout(() => {
        navigate('/candidate/dashboard');
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [phase, navigate]);

  // 안내 메시지
  let statusMsg = '';
  if (phase === 'think') statusMsg = '답변을 준비하세요.';
  else if (phase === 'answer') statusMsg = recording ? '답변을 녹화 중입니다...' : '녹화 준비 중...';
  else if (phase === 'upload') statusMsg = uploading ? '업로드 중...' : '업로드 준비 중...';
  else if (phase === 'done') statusMsg = '면접이 완료되었습니다!';

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1, padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 24, background: '#f8f9fa' }}>
        {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
        <div style={{ fontWeight: 600, marginBottom: 24 }}>면접 질문</div>
        <div style={{ fontSize: 22, marginBottom: 32 }}>{questions[currentIdx]}</div>
        <div style={{ fontSize: 18, marginBottom: 16 }}>{phase === 'think' ? '생각 시간' : phase === 'answer' ? '답변 시간' : ''}</div>
        <div style={{ fontSize: 48, fontWeight: 700, color: '#30C59B', marginBottom: 24 }}>{phase !== 'done' ? timer + '초' : ''}</div>
        <div style={{ color: '#888', fontSize: 18 }}>{statusMsg}</div>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#222' }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ width: '80%', borderRadius: 16, background: '#000' }}
        />
      </div>
    </div>
  );
};

export default InterviewSession; 
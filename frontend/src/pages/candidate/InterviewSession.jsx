import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function InterviewSession() {
  const { scheduleId } = useParams();
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const navigate = useNavigate();

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

  const startRecording = () => {
    if (!stream) return;
    const mediaRecorder = new window.MediaRecorder(stream, { mimeType: 'video/webm' });
    let chunks = [];
    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      await uploadVideo(blob);
      alert('면접 영상이 성공적으로 업로드되었습니다!');
      navigate('/candidate/dashboard');
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

  const uploadVideo = async (blob) => {
    const formData = new FormData();
    formData.append('videoFile', blob, `interview_${scheduleId || Date.now()}.webm`);
    formData.append('scheduleId', scheduleId);

    const res = await fetch('http://localhost:8081/api/interview-schedules/upload-video', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      alert('업로드 실패');
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <h2>AI 면접 진행 중 (면접 ID: {scheduleId})</h2>
      <video ref={videoRef} autoPlay playsInline style={{ width: 480, height: 360, background: '#000' }} />
      <div style={{ margin: '16px 0' }}>
        {!recording ? (
          <button onClick={startRecording}>녹화 시작</button>
        ) : (
          <button onClick={stopRecording}>녹화 종료 및 업로드</button>
        )}
      </div>
      {/* 면접관 아바타/질문 등 추가 UI는 여기에 */}
    </div>
  );
}

export default InterviewSession; 
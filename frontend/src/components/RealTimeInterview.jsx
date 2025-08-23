import React, { useState, useRef, useEffect } from 'react';
import './RealTimeInterview.css';

const RealTimeInterview = ({ 
  candidateId, 
  postId, 
  companyName, 
  postTitle, 
  onInterviewComplete,
  onClose 
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  // WebRTC 연결 설정
  useEffect(() => {
    initializeWebRTC();
    return () => {
      cleanupWebRTC();
    };
  }, []);

  const initializeWebRTC = async () => {
    try {
      // 로컬 미디어 스트림 가져오기
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // WebRTC PeerConnection 설정
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      });

      // 로컬 스트림 추가
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // 원격 스트림 처리
      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // ICE 후보 처리
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // 실제 구현에서는 시그널링 서버를 통해 상대방에게 전송
          console.log('ICE candidate:', event.candidate);
        }
      };

      // 연결 상태 변경 처리
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          setIsConnected(true);
        }
      };

      peerConnectionRef.current = pc;

    } catch (error) {
      console.error('WebRTC 초기화 실패:', error);
      alert('카메라/마이크 접근 권한이 필요합니다.');
    }
  };

  const cleanupWebRTC = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
  };

  // 면접 시작
  const startInterview = () => {
    setIsConnected(true);
  };

  // 녹화 시작
  const startRecording = () => {
    if (!localStreamRef.current) return;

    try {
      recordedChunksRef.current = [];
      const stream = localStreamRef.current;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        uploadRecording();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      // 녹화 시간 타이머 시작
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('녹화 시작 실패:', error);
      alert('녹화를 시작할 수 없습니다.');
    }
  };

  // 녹화 중지
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  // 녹화 파일 업로드
  const uploadRecording = async () => {
    if (recordedChunksRef.current.length === 0) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // 녹화된 데이터를 Blob으로 변환
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      
      // FormData 생성
      const formData = new FormData();
      formData.append('file', blob, `interview_${candidateId}_${postId}_${Date.now()}.webm`);
      formData.append('candidate_id', candidateId);
      formData.append('post_id', postId);
      formData.append('interview_type', 'executive_interview');

      // 백엔드 API로 업로드
      const response = await fetch('http://localhost:8081/api/executive-interview/upload-recording', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setUploadProgress(100);
        
        // 면접 완료 콜백 호출
        onInterviewComplete({
          success: true,
          s3Key: result.s3_key,
          recordingDuration: recordingTime,
          message: '면접 녹화가 성공적으로 업로드되었습니다.'
        });
      } else {
        throw new Error('업로드 실패');
      }

    } catch (error) {
      console.error('녹화 업로드 실패:', error);
      onInterviewComplete({
        success: false,
        error: '녹화 업로드에 실패했습니다.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  // 면접 종료
  const endInterview = () => {
    if (isRecording) {
      stopRecording();
    } else {
      cleanupWebRTC();
      onClose();
    }
  };

  // 시간 포맷팅
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="real-time-interview-overlay">
      <div className="real-time-interview-container">
        {/* 헤더 */}
        <div className="interview-header">
          <div className="interview-info">
            <h2>실시간 임원면접</h2>
            <p>{companyName} - {postTitle}</p>
          </div>
          <div className="interview-controls">
            {!isConnected ? (
              <button 
                className="start-btn"
                onClick={startInterview}
              >
                면접 시작
              </button>
            ) : (
              <>
                {!isRecording ? (
                  <button 
                    className="record-btn"
                    onClick={startRecording}
                  >
                    녹화 시작
                  </button>
                ) : (
                  <button 
                    className="stop-btn"
                    onClick={stopRecording}
                  >
                    녹화 중지
                  </button>
                )}
                <button 
                  className="end-btn"
                  onClick={endInterview}
                >
                  면접 종료
                </button>
              </>
            )}
            <button 
              className="close-btn"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>

        {/* 비디오 영역 */}
        <div className="video-container">
          <div className="local-video">
            <video 
              ref={localVideoRef} 
              autoPlay 
              muted 
              playsInline
              className="video-element"
            />
            <div className="video-label">나 (지원자)</div>
          </div>
          
          <div className="remote-video">
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline
              className="video-element"
            />
            <div className="video-label">면접관</div>
          </div>
        </div>

        {/* 상태 표시 */}
        <div className="interview-status">
          <div className="status-item">
            <span className="status-label">연결 상태:</span>
            <span className={`status-value ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? '연결됨' : '연결 대기 중'}
            </span>
          </div>
          
          {isRecording && (
            <div className="status-item">
              <span className="status-label">녹화 시간:</span>
              <span className="status-value recording">
                {formatTime(recordingTime)}
              </span>
            </div>
          )}
          
          {isUploading && (
            <div className="status-item">
              <span className="status-label">업로드 진행률:</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="status-value">{uploadProgress}%</span>
            </div>
          )}
        </div>

        {/* 안내 메시지 */}
        <div className="interview-guidance">
          <p>
            {!isConnected ? '면접 시작 버튼을 클릭하여 면접을 시작하세요.' :
             !isRecording ? '녹화 시작 버튼을 클릭하여 면접을 녹화하세요.' :
             '면접이 녹화되고 있습니다. 면접 종료 시 녹화가 자동으로 업로드됩니다.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RealTimeInterview; 
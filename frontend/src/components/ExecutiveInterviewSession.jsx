import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ExecutiveInterviewSession.css';

const ExecutiveInterviewSession = () => {
  const { jobCandidateId } = useParams();
  const navigate = useNavigate();
  
  // URL 파라미터에서 postId 추출
  const urlParams = new URLSearchParams(window.location.search);
  const postIdFromUrl = urlParams.get('postId') || urlParams.get('post_id');
  
  // 사용자 타입 감지 (관리자 vs 지원자)
  const userType = localStorage.getItem('userType');
  const isAdmin = userType === 'company';
  const isCandidate = userType === 'candidate';
  
  console.log('현재 사용자 타입:', userType);
  console.log('관리자 여부:', isAdmin);
  console.log('지원자 여부:', isCandidate);
  console.log('URL 파라미터 postId:', postIdFromUrl);
  console.log('jobCandidateId:', jobCandidateId);
  
  // candidate 정보를 jobCandidateId로 조회
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  // 지원자 준비 상태 추가
  const [isCandidateReady, setIsCandidateReady] = useState(false);
  const [candidateReadyStatus, setCandidateReadyStatus] = useState('waiting'); // waiting, ready, in-interview
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // candidate 정보 조회
    const fetchCandidateInfo = async () => {
      try {
        setLoading(true);
        // job_cand_progress에서 candidate 정보 조회
        const response = await fetch(`http://localhost:8081/api/progress/job-cand-progress/${jobCandidateId}`);
        if (response.ok) {
          const data = await response.json();
          setCandidate(data);
          
          // postId가 없으면 candidate 정보에서 추출
          if (!postIdFromUrl && data?.post?.postId) {
            console.log('candidate 정보에서 postId 추출:', data.post.postId);
          }
        } else {
          console.error('candidate 정보 조회 실패:', response.status);
        }
      } catch (error) {
        console.error('candidate 정보 조회 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (jobCandidateId) {
      fetchCandidateInfo();
    }
  }, [jobCandidateId, postIdFromUrl]);
  
  useEffect(() => {
    startVideoStream();
    return () => {
      stopVideoStream();
    };
  }, []);

  const startVideoStream = async () => {
    try {
      console.log('비디오 스트림 시작 시도...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      console.log('비디오 스트림 획득 성공:', stream);
      console.log('비디오 트랙:', stream.getVideoTracks());
      console.log('오디오 트랙:', stream.getAudioTracks());
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('비디오 엘리먼트에 스트림 설정됨');
      } else {
        console.error('videoRef.current가 null입니다');
      }
      
      streamRef.current = stream;
      console.log('streamRef.current 설정됨:', streamRef.current);
    } catch (error) {
      console.error('비디오 스트림 시작 실패:', error);
      alert('카메라/마이크 접근 권한이 필요합니다: ' + error.message);
    }
  };

  const stopVideoStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const startRecording = () => {
    console.log('startRecording 함수 호출됨');
    console.log('streamRef.current:', streamRef.current);
    
    if (!streamRef.current) {
      console.error('비디오 스트림이 없습니다');
      alert('비디오 스트림을 먼저 시작해주세요.');
      return;
    }

    try {
      console.log('MediaRecorder 생성 시작');
      const recorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });

      const chunks = [];
      
      recorder.ondataavailable = (event) => {
        console.log('데이터 수신:', event.data.size);
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        console.log('녹화 중지됨, 청크 수:', chunks.length);
        setRecordedChunks(chunks);
        setIsRecording(false);
        clearInterval(timerRef.current);
        // 면접 종료 시 지원자 상태를 waiting으로 변경
        if (isAdmin) {
          sendReadyStatus('waiting');
        }
      };

      recorder.onstart = () => {
        console.log('녹화 시작됨');
        // 면접 시작 시 지원자 상태를 in-interview로 변경
        if (isAdmin) {
          sendReadyStatus('in-interview');
        }
      };

      recorder.onerror = (event) => {
        console.error('MediaRecorder 오류:', event.error);
        alert('녹화 중 오류가 발생했습니다: ' + event.error);
      };

      console.log('녹화 시작...');
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      // 타이머 시작
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      console.log('녹화 상태:', isRecording);

    } catch (error) {
      console.error('녹화 시작 실패:', error);
      alert('녹화를 시작할 수 없습니다: ' + error.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const uploadToS3 = async () => {
    if (!recordedChunks.length) {
      alert('녹화된 내용이 없습니다.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      // candidate_id가 없으면 jobCandidateId 또는 다른 식별자 사용
      let candidateId = candidate?.jobCandidateId;
      let postId = postIdFromUrl || candidate?.post?.postId;
      
      // candidate 객체가 null인 경우 URL 파라미터에서 정보 추출
      if (!candidateId || !postId) {
        const urlParams = new URLSearchParams(window.location.search);
        candidateId = candidateId || urlParams.get('jobCandidateId') || urlParams.get('candidateId') || 'unknown';
        postId = postId || urlParams.get('postId') || urlParams.get('post_id') || 'unknown';
        
        console.log('URL 파라미터에서 추출한 정보:', {
          candidateId,
          postId,
          urlParams: Object.fromEntries(urlParams.entries())
        });
      }
      
      // 최종 검증
      if (candidateId === 'unknown' || postId === 'unknown') {
        console.error('필수 파라미터 누락:', { candidateId, postId });
        alert('지원자 정보나 공고 정보를 찾을 수 없습니다. 페이지를 새로고침해주세요.');
        return;
      }
      
      const filename = `executive_interview_${candidateId}_${timestamp}.webm`;
      
      console.log('업로드 준비:', {
        filename,
        blobSize: blob.size,
        recordedChunksLength: recordedChunks.length,
        candidateId: candidateId,
        postId: postId,
        userType: userType,
        candidate: candidate
      });
      
      // FormData 생성
      const formData = new FormData();
      formData.append('file', blob, filename);
      formData.append('candidate_id', candidateId);
      formData.append('post_id', postId);
      formData.append('interview_type', 'executive');
      formData.append('user_type', userType || 'unknown');
      formData.append('recording_duration', recordingTime.toString());
      
      // 회사 관리자인 경우 관리자 ID 추가
      if (userType === 'company') {
        const adminId = localStorage.getItem('userId') || 'unknown';
        formData.append('company_admin_id', adminId);
      }

      console.log('FormData 생성 완료:', {
        file: filename,
        candidate_id: candidateId,
        post_id: postId,
        interview_type: 'executive',
        user_type: userType || 'unknown',
        recording_duration: recordingTime.toString()
      });

      // Python API의 S3 업로드 엔드포인트로 직접 호출
      const response = await fetch('http://localhost:8006/upload-recording', {
        method: 'POST',
        body: formData
      });

      console.log('API 응답:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.ok) {
        const result = await response.json();
        console.log('업로드 성공 결과:', result);
        
        alert('면접 녹화가 S3에 성공적으로 업로드되었습니다!');
        
        // 면접 완료 처리
        console.log('면접 녹화 완료:', {
          s3Key: result.s3_key,
          filename: filename,
          duration: recordingTime,
          candidateId: candidateId,
          s3Url: result.s3_url
        });
        
        // 면접 완료 후 이전 페이지로 이동
        navigate(-1);
      } else {
        const errorData = await response.json().catch(() => ({ detail: '알 수 없는 오류' }));
        console.error('업로드 실패 응답:', errorData);
        throw new Error(errorData.detail || '업로드 실패');
      }

    } catch (error) {
      console.error('S3 업로드 실패:', error);
      console.error('오류 상세 정보:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      alert(`S3 업로드에 실패했습니다: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    if (isRecording) {
      if (window.confirm('녹화 중입니다. 정말 종료하시겠습니까?')) {
        stopRecording();
      } else {
        return;
      }
    }
    navigate(-1); // 이전 페이지로 돌아가기
  };

  // 지원자 준비 상태를 서버에 전송
  const sendReadyStatus = async (status) => {
    try {
      console.log('준비 상태 전송 시도:', status, 'jobCandidateId:', jobCandidateId);
      
      const requestBody = {
        jobCandidateId: jobCandidateId,
        status: status,
        timestamp: new Date().toISOString()
      };
      
      console.log('요청 본문:', requestBody);
      
      const response = await fetch(`http://localhost:8081/api/interview/candidate-ready-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('응답 상태:', response.status);
      console.log('응답 헤더:', response.headers);

      if (response.ok) {
        const result = await response.json();
        console.log('준비 상태 전송 성공:', result);
        if (status === 'ready') {
          setIsCandidateReady(true);
          setCandidateReadyStatus('ready');
        } else if (status === 'waiting') {
          setIsCandidateReady(false);
          setCandidateReadyStatus('waiting');
        }
      } else {
        const errorText = await response.text();
        console.error('준비 상태 전송 실패:', response.status, errorText);
        alert(`준비 상태 전송 실패: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('준비 상태 전송 오류:', error);
      console.error('오류 상세:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        if (error.message.includes('CORS')) {
          alert('CORS 정책 오류가 발생했습니다. 백엔드 서버의 CORS 설정을 확인해주세요.');
        } else {
          alert('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
        }
      } else if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
        alert('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
      } else {
        alert('준비 상태 전송 중 오류가 발생했습니다: ' + error.message);
      }
    }
  };

  // 지원자 준비 상태를 주기적으로 확인 (관리자용)
  const checkCandidateStatus = async () => {
    if (!isAdmin) return;
    
    try {
      const response = await fetch(`http://localhost:8081/api/interview/candidate-status/${jobCandidateId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('지원자 상태 확인 결과:', data);
        setCandidateReadyStatus(data.status);
        setIsCandidateReady(data.status === 'ready');
      }
    } catch (error) {
      console.error('지원자 상태 확인 오류:', error);
    }
  };

  // 주기적으로 지원자 상태 확인 (관리자용)
  useEffect(() => {
    if (isAdmin) {
      // 초기 상태 확인
      checkCandidateStatus();
      
      const interval = setInterval(checkCandidateStatus, 2000); // 2초마다 확인
      return () => clearInterval(interval);
    }
  }, [isAdmin, jobCandidateId]);

  if (loading) {
    return (
      <div className="executive-interview-session">
        <div className="interview-header">
          <h2>임원면접 세션</h2>
        </div>
        <div className="loading-message">
          <p>면접 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }
  
  if (!candidate) {
    return (
      <div className="executive-interview-session">
        <div className="interview-header">
          <h2>임원면접 세션</h2>
          <button onClick={() => navigate(-1)} className="close-btn">
            뒤로 가기
          </button>
        </div>
        <div className="error-message">
          <p>면접 정보를 찾을 수 없습니다.</p>
          <button onClick={() => navigate(-1)} className="back-btn">
            이전 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="executive-interview-session">
      <div className="interview-header">
        <h2>
          {isAdmin ? '🏢 관리자 - 임원면접 진행' : '👤 지원자 - 임원면접 참여'}
        </h2>
        
        <div className="candidate-info">
          <span><strong>지원자:</strong> {candidate?.candidate?.candidateName || '이름 없음'}</span>
          <span><strong>공고:</strong> {candidate?.post?.postTitle || '제목 없음'}</span>
          <span><strong>면접 일시:</strong> {candidate?.executiveInterviewSchedule?.interviewDate ? 
            new Date(candidate.executiveInterviewSchedule.interviewDate).toLocaleString('ko-KR') : '일정 없음'
          }</span>
        </div>
        
        <button className="close-btn" onClick={handleClose}>
          {isAdmin ? '면접 종료' : '면접 나가기'}
        </button>
      </div>

      <div className="video-container">
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline
          className="interview-video"
        />
        
        {isRecording && (
          <div className="recording-indicator">
            <div className="recording-dot"></div>
            <span>
              {isAdmin ? '🎬 녹화 중...' : '🎥 면접 진행 중...'} {formatTime(recordingTime)}
            </span>
          </div>
        )}
      </div>

      <div className="interview-controls">
        {isAdmin ? (
          // 관리자용 컨트롤
          <>
            {!isRecording ? (
              <button 
                className="start-btn"
                onClick={startRecording}
                disabled={!streamRef.current || !candidate || !isCandidateReady}
                title={
                  !streamRef.current ? '카메라/마이크 권한이 필요합니다' : 
                  !candidate ? '지원자 정보를 불러오는 중입니다' : 
                  !isCandidateReady ? '지원자가 아직 준비되지 않았습니다' : 
                  '면접 녹화를 시작합니다'
                }
              >
                🎬 면접 시작 {!isCandidateReady && '(지원자 대기 중)'}
              </button>
            ) : (
              <button 
                className="stop-btn"
                onClick={stopRecording}
              >
                ⏹️ 면접 종료
              </button>
            )}

            {recordedChunks.length > 0 && !isRecording && (
              <button 
                className="upload-btn"
                onClick={uploadToS3}
                disabled={isUploading}
              >
                {isUploading ? `📤 업로드 중... ${uploadProgress}%` : '📤 S3에 업로드'}
              </button>
            )}

            {/* 지원자 준비 상태 표시 */}
            <div className="candidate-status-display">
              <span className={`status-badge ${candidateReadyStatus}`}>
                {candidateReadyStatus === 'waiting' && '⏳ 지원자 대기 중'}
                {candidateReadyStatus === 'ready' && '✅ 지원자 준비 완료'}
                {candidateReadyStatus === 'in-interview' && '🎥 면접 진행 중'}
              </span>
            </div>
          </>
        ) : (
          // 지원자용 컨트롤
          <div className="candidate-controls">
            <div className="status-indicator">
              {isRecording ? (
                <div className="recording-status">
                  <div className="recording-dot"></div>
                  <span>🎥 면접 진행 중...</span>
                </div>
              ) : isCandidateReady ? (
                <div className="ready-status">
                  <span>✅ 면접 준비 완료! 관리자 기다리는 중...</span>
                </div>
              ) : (
                <div className="waiting-status">
                  <span>⏳ 면접 시작을 기다리는 중...</span>
                </div>
              )}
            </div>
            
            {!isCandidateReady && !isRecording && (
              <button 
                className="ready-btn"
                onClick={() => sendReadyStatus('ready')}
              >
                ✅ 면접 준비 완료
              </button>
            )}
            
            {isCandidateReady && !isRecording && (
              <button 
                className="cancel-ready-btn"
                onClick={() => sendReadyStatus('waiting')}
              >
                ❌ 준비 취소
              </button>
            )}
          </div>
        )}
      </div>

      {isUploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <span>{uploadProgress}%</span>
        </div>
      )}

      <div className="interview-instructions">
        <h3>
          {isAdmin ? '🏢 관리자 가이드' : '👤 지원자 가이드'}
        </h3>
        
        {isAdmin ? (
          <ul>
            <li>🎬 면접 시작 버튼을 눌러 녹화를 시작하세요</li>
            <li>⏹️ 면접이 끝나면 면접 종료 버튼을 누르세요</li>
            <li>📤 녹화가 완료되면 S3에 업로드 버튼을 누르세요</li>
            <li>🤖 업로드된 파일은 자동으로 AI 분석에 사용됩니다</li>
            <li>💡 지원자에게 명확한 질문을 하고 답변을 경청하세요</li>
          </ul>
        ) : (
          <ul>
            <li>🎥 면접 시작을 기다리는 동안 카메라와 마이크를 확인하세요</li>
            <li>✅ 면접 준비 완료 버튼을 눌러 준비 상태를 알려주세요</li>
            <li>🗣️ 질문에 대해 명확하고 구체적으로 답변하세요</li>
            <li>📝 중요한 내용은 메모해두세요</li>
            <li>😊 긴장하지 말고 자연스럽게 대화하세요</li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default ExecutiveInterviewSession; 
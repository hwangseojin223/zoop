import React, { useState, useRef, useEffect } from 'react';
import './InterviewEnvironmentCheck.css';

function InterviewEnvironmentCheck({ interviewLink, onComplete, onBack }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [cameraTest, setCameraTest] = useState({ passed: false, testing: false });
  const [microphoneTest, setMicrophoneTest] = useState({ passed: false, testing: false });
  const [speakerTest, setSpeakerTest] = useState({ passed: false, testing: false });
  const [permissions, setPermissions] = useState({ camera: false, microphone: false });
  const [audioLevel, setAudioLevel] = useState(0);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const steps = [
    {
      title: "환경 체크 시작",
      description: "AI 면접을 위한 환경을 체크합니다.",
      icon: "🔍"
    },
    {
      title: "카메라 테스트",
      description: "카메라가 정상적으로 작동하는지 확인합니다.",
      icon: "📹"
    },
    {
      title: "마이크 테스트", 
      description: "마이크가 정상적으로 작동하는지 확인합니다.",
      icon: "🎤"
    },
    {
      title: "스피커 테스트",
      description: "스피커가 정상적으로 작동하는지 확인합니다.",
      icon: "🔊"
    },
    {
      title: "체크 완료",
      description: "모든 환경 체크가 완료되었습니다.",
      icon: "✅"
    }
  ];

  useEffect(() => {
    // 컴포넌트 언마운트 시 스트림 정리
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      stopAudioMonitoring();
    };
  }, []);

  const checkPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      setPermissions({
        camera: stream.getVideoTracks().length > 0,
        microphone: stream.getAudioTracks().length > 0
      });
      
      streamRef.current = stream;
      return true;
    } catch (error) {
      console.error('권한 요청 실패:', error);
      setPermissions({ camera: false, microphone: false });
      return false;
    }
  };

  const startCameraTest = async () => {
    setCameraTest({ passed: false, testing: true });
    
    try {
      const hasPermission = await checkPermissions();
      if (!hasPermission) {
        setCameraTest({ passed: false, testing: false });
        return;
      }

      if (videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        setCameraTest({ passed: true, testing: false });
      }
    } catch (error) {
      console.error('카메라 테스트 실패:', error);
      setCameraTest({ passed: false, testing: false });
    }
  };

  const startMicrophoneTest = async () => {
    setMicrophoneTest({ passed: false, testing: true });
    setAudioLevel(0);
    
    try {
      if (!streamRef.current) {
        await checkPermissions();
      }
      
      // 오디오 컨텍스트 생성
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      // 오디오 레벨 모니터링 함수
      const updateAudioLevel = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average);
        
        // 오디오 레벨이 일정 수준 이상이면 마이크가 작동한다고 판단
        if (average > 5) {
          setMicrophoneTest({ passed: true, testing: false });
          stopAudioMonitoring();
        } else {
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      
      // 모니터링 시작
      updateAudioLevel();
      
      // 5초 후에도 오디오가 감지되지 않으면 테스트 실패
      setTimeout(() => {
        if (microphoneTest.testing) {
          setMicrophoneTest({ passed: false, testing: false });
          stopAudioMonitoring();
        }
      }, 5000);
      
    } catch (error) {
      console.error('마이크 테스트 실패:', error);
      setMicrophoneTest({ passed: false, testing: false });
      stopAudioMonitoring();
    }
  };

  const stopAudioMonitoring = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  const startSpeakerTest = () => {
    setSpeakerTest({ passed: false, testing: true });
    
    try {
      // 브라우저의 기본 오디오 API를 사용하여 간단한 테스트 음성 생성
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 음
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // 볼륨을 낮게 설정
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1); // 1초간 재생
      
      // 1초 후에 테스트 완료로 설정
      setTimeout(() => {
        setSpeakerTest({ passed: true, testing: false });
      }, 1000);
      
    } catch (error) {
      console.error('스피커 테스트 실패:', error);
      setSpeakerTest({ passed: false, testing: false });
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStartInterview = () => {
    if (onComplete) {
      onComplete();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="step-content">
            <h3>면접 환경 체크를 시작합니다</h3>
            <p>다음 단계에서 카메라, 마이크, 스피커를 순서대로 테스트합니다.</p>
            <div className="checklist">
              <div className="checklist-item">
                <span className="check-icon">📹</span>
                <span>카메라 권한 허용</span>
              </div>
              <div className="checklist-item">
                <span className="check-icon">🎤</span>
                <span>마이크 권한 허용</span>
              </div>
              <div className="checklist-item">
                <span className="check-icon">🔊</span>
                <span>스피커/헤드폰 준비</span>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="step-content">
            <h3>카메라 테스트</h3>
            <div className="test-area">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="camera-preview"
              />
              <div className="test-controls">
                <button 
                  onClick={startCameraTest}
                  disabled={cameraTest.testing}
                  className="test-button"
                >
                  {cameraTest.testing ? '테스트 중...' : '카메라 테스트 시작'}
                </button>
                {cameraTest.passed && (
                  <div className="test-result success">
                    ✅ 카메라가 정상적으로 작동합니다
                  </div>
                )}
                {!cameraTest.passed && !cameraTest.testing && (
                  <div className="test-result error">
                    ❌ 카메라 테스트가 필요합니다
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h3>마이크 테스트</h3>
            <div className="test-area">
              <div className="microphone-visualizer">
                <div className="mic-icon">🎤</div>
                <div className="audio-level">
                  <div 
                    className="level-bar" 
                    style={{ 
                      width: `${Math.min((audioLevel / 255) * 100, 100)}%`,
                      backgroundColor: audioLevel > 5 ? '#4CAF50' : '#ddd'
                    }}
                  ></div>
                </div>
                {microphoneTest.testing && (
                  <p className="test-instruction">
                    마이크에 말을 해보세요! 오디오 레벨이 올라가면 테스트가 완료됩니다.
                  </p>
                )}
              </div>
              <div className="test-controls">
                <button 
                  onClick={startMicrophoneTest}
                  disabled={microphoneTest.testing}
                  className="test-button"
                >
                  {microphoneTest.testing ? '테스트 중... (말을 해보세요)' : '마이크 테스트 시작'}
                </button>
                {microphoneTest.passed && (
                  <div className="test-result success">
                    ✅ 마이크가 정상적으로 작동합니다
                  </div>
                )}
                {!microphoneTest.passed && !microphoneTest.testing && (
                  <div className="test-result error">
                    ❌ 마이크 테스트가 필요합니다
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h3>스피커 테스트</h3>
            <div className="test-area">
              <div className="speaker-test">
                <div className="speaker-icon">🔊</div>
                <p>아래 버튼을 클릭하면 테스트 음이 재생됩니다.</p>
                <p className="test-note">* 스피커나 헤드폰에서 소리가 들리는지 확인해주세요</p>
              </div>
              <div className="test-controls">
                <button 
                  onClick={startSpeakerTest}
                  disabled={speakerTest.testing}
                  className="test-button"
                >
                  {speakerTest.testing ? '재생 중...' : '스피커 테스트 시작'}
                </button>
                {speakerTest.passed && (
                  <div className="test-result success">
                    ✅ 스피커가 정상적으로 작동합니다
                  </div>
                )}
                {!speakerTest.passed && !speakerTest.testing && (
                  <div className="test-result error">
                    ❌ 스피커 테스트가 필요합니다
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        const allTestsPassed = cameraTest.passed && microphoneTest.passed && speakerTest.passed;
        return (
          <div className="step-content">
            <h3>환경 체크 완료</h3>
            <div className="completion-summary">
              <div className={`test-summary ${cameraTest.passed ? 'passed' : 'failed'}`}>
                <span>📹 카메라: {cameraTest.passed ? '✅ 통과' : '❌ 실패'}</span>
              </div>
              <div className={`test-summary ${microphoneTest.passed ? 'passed' : 'failed'}`}>
                <span>🎤 마이크: {microphoneTest.passed ? '✅ 통과' : '❌ 실패'}</span>
              </div>
              <div className={`test-summary ${speakerTest.passed ? 'passed' : 'failed'}`}>
                <span>🔊 스피커: {speakerTest.passed ? '✅ 통과' : '❌ 실패'}</span>
              </div>
            </div>
            {allTestsPassed ? (
              <div className="completion-message success">
                <h4>🎉 모든 테스트가 완료되었습니다!</h4>
                <p>이제 AI 면접을 시작할 수 있습니다.</p>
              </div>
            ) : (
              <div className="completion-message warning">
                <h4>⚠️ 일부 테스트가 실패했습니다</h4>
                <p>실패한 항목을 다시 확인하고 면접을 시작하세요.</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="environment-check-container">
      <div className="check-header">
        <h2>AI 면접 환경 체크</h2>
        <p>면접을 시작하기 전에 환경을 확인해주세요</p>
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        ></div>
      </div>

      <div className="step-indicator">
        <span className="step-number">{currentStep + 1}</span>
        <span className="step-total">/ {steps.length}</span>
      </div>

      <div className="step-info">
        <div className="step-icon">{steps[currentStep].icon}</div>
        <div className="step-text">
          <h3>{steps[currentStep].title}</h3>
          <p>{steps[currentStep].description}</p>
        </div>
      </div>

      <div className="step-content-wrapper">
        {renderStepContent()}
      </div>

      <div className="navigation-buttons">
        {currentStep > 0 && (
          <button onClick={handleBack} className="nav-button back">
            이전
          </button>
        )}
        
        {currentStep < steps.length - 1 ? (
          <button 
            onClick={handleNext} 
            className="nav-button next"
            disabled={
              (currentStep === 1 && !cameraTest.passed) ||
              (currentStep === 2 && !microphoneTest.passed) ||
              (currentStep === 3 && !speakerTest.passed)
            }
          >
            다음
          </button>
        ) : (
          <button 
            onClick={handleStartInterview} 
            className="nav-button start-interview"
            disabled={!cameraTest.passed || !microphoneTest.passed || !speakerTest.passed}
          >
            AI 면접 시작하기
          </button>
        )}
      </div>

      <button onClick={onBack} className="back-to-check">
        환경 체크 건너뛰기
      </button>
    </div>
  );
}

export default InterviewEnvironmentCheck; 
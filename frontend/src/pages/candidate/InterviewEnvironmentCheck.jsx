import React, { useEffect, useRef, useState } from 'react';
import './InterviewEnvironmentCheck.css';
import { useNavigate, useParams } from 'react-router-dom';

const SENTENCES = [
  '나는 무엇이든 할 수 있는 사람이다.',
  '오늘도 최선을 다하겠습니다.',
  '긍정적인 마음으로 임하겠습니다.',
  '새로운 도전을 두려워하지 않습니다.',
  '함께 성장하는 것을 좋아합니다.'
];

// Slide data for 2/4, 3/4, 4/4
const SLIDES = [
  {
    step: 2,
    title: '영상 과제는 답변을 준비하는 시간과\n녹화하는 시간이 따로 주어져요.',
    desc: '준비 시간에는 녹화하지 않고, 답변 시간에만 녹화를 진행해요.',
    img: 'https://cdn.pixabay.com/photo/2017/01/31/13/14/avatar-2026510_1280.png',
    button: '다음',
  },
  {
    step: 3,
    title: '준비 시간 동안에는 질문을 확인하고\n답변을 생각해 주세요.',
    desc: '준비 시간이 끝나면 자동으로 답변 시간이 시작돼요.',
    img: 'https://cdn.pixabay.com/photo/2017/01/31/13/14/avatar-2026510_1280.png',
    button: '다음',
  },
  {
    step: 4,
    title: '답변 시간 동안에는 녹화가 시작되니\n편하게 답변해 주세요.',
    desc: '다시하기 버튼을 누르면 한 번의 다시 할 기회가 주어져요.',
    img: 'https://cdn.pixabay.com/photo/2017/01/31/13/14/avatar-2026510_1280.png',
    button: '면접 시작하기',
  },
];

function InterviewGuideSlides({ onStart }) {
  const [current, setCurrent] = useState(0); // 0: 2/4, 1: 3/4, 2: 4/4
  const [timeLeft, setTimeLeft] = useState(600); // 10분 = 600초
  const navigate = useNavigate();
  const { id } = useParams(); // scheduleId, if available
  const slide = SLIDES[current];

  // 카운트다운 타이머
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          // 시간이 다 되면 면접 시작
          handleStartInterview();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 시간을 MM:SS 형식으로 변환
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStartInterview = () => {
    // 면접 세션 페이지로 이동 (예: /interview-session/:id)
    if (id) {
      navigate(`/interview-session/${id}`);
    } else {
      navigate('/interview-session/1'); // fallback
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafbfc' }}>
      <div style={{ background: 'white', borderRadius: 32, boxShadow: '0 12px 48px rgba(0,0,0,0.12)', padding: 48, width: 520, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* 탭/진행 표시 */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', marginBottom: 32 }}>
          <div style={{ flex: 1, display: 'flex', gap: 24, fontWeight: 600, fontSize: 18 }}>
            <span style={{ color: '#888' }}>자기소개</span>
            <span style={{ color: '#222' }}>설명 <b>({slide.step}/4)</b></span>
          </div>
          <div style={{ background: '#f4f8ff', color: '#30C59B', fontWeight: 700, fontSize: 18, borderRadius: 12, padding: '6px 22px' }}>{formatTime(timeLeft)}</div>
        </div>
        {/* 제목/설명 */}
        <div style={{ fontWeight: 800, fontSize: 22, textAlign: 'center', marginBottom: 8, color: '#222', whiteSpace: 'pre-line' }}>
          {slide.title}
        </div>
        <div style={{ color: '#bbb', fontSize: 16, textAlign: 'center', marginBottom: 32 }}>
          {slide.desc}
        </div>
        {/* 일러스트/이미지 */}
        <div style={{ width: 320, height: 160, background: '#f8f9fa', borderRadius: 18, marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee' }}>
          <img src={slide.img} alt="설명 일러스트" style={{ width: 100, height: 100, objectFit: 'contain', opacity: 0.7 }} />
        </div>
        {/* 네비게이션 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, marginBottom: current === 2 ? 32 : 0 }}>
          <button onClick={() => setCurrent(current - 1)} disabled={current === 0} style={{ width: 48, height: 48, borderRadius: '50%', background: current === 0 ? '#f4f4f4' : '#e6f9f3', border: 'none', color: current === 0 ? '#bbb' : '#30C59B', fontSize: 28, cursor: current === 0 ? 'not-allowed' : 'pointer' }}>←</button>
          <div style={{ display: 'flex', gap: 8 }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: i === current ? '#30C59B' : '#d1fae5', display: 'inline-block' }}></span>
            ))}
          </div>
          {current !== 2 && (
            <button onClick={() => setCurrent(current + 1)} style={{ width: 48, height: 48, borderRadius: '50%', background: '#e6f9f3', border: 'none', color: '#30C59B', fontSize: 28, cursor: 'pointer' }}>→</button>
          )}
        </div>
        {/* 4/4에서만 버튼 노출 */}
        {current === 2 && (
          <button
            onClick={handleStartInterview}
            style={{ width: 'auto', padding: '16px 32px', borderRadius: 20, border: 'none', background: '#30C59B', color: 'white', fontWeight: 600, fontSize: 18, cursor: 'pointer', marginTop: 8 }}
          >
            {slide.button}
          </button>
        )}
      </div>
    </div>
  );
}

function InterviewEnvironmentCheck({ onComplete }) {
  const [step, setStep] = useState('ready'); // 'ready' | 'testing' | 'result' | 'guide'
  const [selectedSentence, setSelectedSentence] = useState('');
  const [micLevel, setMicLevel] = useState(0);
  const [voiceSuccess, setVoiceSuccess] = useState(false);
  const [faceSuccess] = useState(true); // Always true for now
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [testTimer, setTestTimer] = useState(0);
  const [testActive, setTestActive] = useState(false);
  const [voiceDetected, setVoiceDetected] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    setSelectedSentence(SENTENCES[Math.floor(Math.random() * SENTENCES.length)]);
  }, [step]);

  useEffect(() => {
    async function startMedia() {
      const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(userStream);
      if (videoRef.current) {
        videoRef.current.srcObject = userStream;
      }
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(userStream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
    }
    startMedia();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (step !== 'testing') return;
    let timer = 0;
    let detected = false;
    function updateLevel() {
      if (!analyserRef.current) return;
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setMicLevel(avg);
      if (avg > 15) detected = true;
      timer += 1;
      setTestTimer(timer);
      if (timer < 60) {
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      } else {
        setVoiceDetected(detected);
        setVoiceSuccess(detected);
        setStep('result');
      }
    }
    setTestTimer(0);
    setVoiceDetected(false);
    animationFrameRef.current = requestAnimationFrame(updateLevel);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [step]);

  const handleStartTest = () => {
    setStep('testing');
  };
  const handleRetry = () => {
    setStep('ready');
    setVoiceSuccess(false);
    setVoiceDetected(false);
    setMicLevel(0);
  };
  const handleComplete = () => {
    setShowGuide(true);
    setStep('guide');
  };
  const handleGuideStart = () => {
    if (onComplete) onComplete();
  };

  const faceStatus = faceSuccess
    ? { icon: '🟩', text: '얼굴 인식 성공', color: '#30C59B', bg: '#e6f9f3', desc: '응시 중에도 지금의 위치를 벗어나지 않도록 유의해 주세요.' }
    : { icon: '🟥', text: '얼굴 인식 실패', color: '#ff4d4f', bg: '#ffeaea', desc: '얼굴이 잘 보이도록 카메라 위치를 조정해 주세요.' };
  const voiceStatus = voiceSuccess
    ? { icon: '🟩', text: '음성 인식 성공', color: '#30C59B', bg: '#e6f9f3', desc: '응시 중에도 지금의 목소리 크기를\n유지해 주세요.' }
    : { icon: '🟥', text: '음성 인식 실패', color: '#ff4d4f', bg: '#ffeaea', desc: '마이크 음량을 조절하거나 조금 더 큰 목소리로 말씀해 주세요.' };

  const mainMsg = step === 'result'
    ? (faceSuccess && voiceSuccess ? '얼굴 인식과 음성 인식이 모두 잘 되고 있어요!' : '음성 인식이 잘 안되고 있어요.')
    : '아래 문장을 또렷하게 읽어주세요.';
  const subMsg = step === 'result'
    ? ''
    : '마이크와 카메라가 정상적으로 동작하는지 확인합니다.';

  if (showGuide || step === 'guide') {
    return <InterviewGuideSlides onStart={handleGuideStart} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafbfc' }}>
      <div style={{ background: 'white', borderRadius: 32, boxShadow: '0 12px 48px rgba(0,0,0,0.12)', padding: 56, width: 600, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 22, textAlign: 'center', marginBottom: 16, color: '#222' }}>{mainMsg}</div>
        {subMsg && <div style={{ color: '#888', fontSize: 18, textAlign: 'center', marginBottom: 32 }}>{subMsg}</div>}
        {step !== 'result' && (
          <div style={{ marginBottom: 32, fontSize: 22, color: '#30C59B', fontWeight: 700, textAlign: 'center', minHeight: 32 }}>
            "{selectedSentence}"
          </div>
        )}
        <div style={{ position: 'relative', width: 480, height: 300, marginBottom: 24 }}>
          <video ref={videoRef} autoPlay playsInline style={{ width: 480, height: 300, background: '#000', borderRadius: 20, objectFit: 'cover' }} />
        </div>
        {step === 'result' && (
          <div style={{ width: '100%', marginBottom: 32, background: '#fff', borderRadius: 16, border: '1px solid #f0f0f0', padding: 0, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', width: '100%' }}>
              <div style={{ flex: 1, background: faceStatus.bg, color: faceStatus.color, borderRadius: 12, padding: '20px 16px', margin: 12, marginRight: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 16, gap: 8, flexDirection: 'column' }}>
                <span style={{ fontSize: 28 }}>{faceStatus.icon}</span> 
                <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.3px' }}>{faceStatus.text}</span>
                <div style={{ fontWeight: 400, fontSize: 13, color: '#666', marginTop: 4, textAlign: 'center', lineHeight: '1.4', letterSpacing: '-0.2px', whiteSpace: 'pre-line' }}>{faceStatus.desc}</div>
              </div>
              <div style={{ flex: 1, background: voiceStatus.bg, color: voiceStatus.color, borderRadius: 12, padding: '20px 16px', margin: 12, marginLeft: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 16, gap: 8, flexDirection: 'column' }}>
                <span style={{ fontSize: 28 }}>{voiceStatus.icon}</span> 
                <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.3px' }}>{voiceStatus.text}</span>
                <div style={{ fontWeight: 400, fontSize: 13, color: '#666', marginTop: 4, textAlign: 'center', lineHeight: '1.4', letterSpacing: '-0.2px', whiteSpace: 'pre-line' }}>{voiceStatus.desc}</div>
              </div>
            </div>
          </div>
        )}
        {step === 'ready' && (
          <button
            onClick={handleStartTest}
            style={{ width: '100%', padding: '22px 0', borderRadius: 20, border: 'none', background: '#30C59B', color: 'white', fontWeight: 700, fontSize: 22, cursor: 'pointer', marginTop: 12, marginBottom: 12 }}
          >
            확인
          </button>
        )}
        {step === 'result' && (
          <div style={{ display: 'flex', width: '100%', gap: 24 }}>
            <button
              onClick={handleComplete}
              disabled={!(faceSuccess && voiceSuccess)}
              style={{ flex: 1, padding: '20px 0', borderRadius: 20, border: 'none', background: '#30C59B', color: 'white', fontWeight: 700, fontSize: 20, cursor: faceSuccess && voiceSuccess ? 'pointer' : 'not-allowed', transition: 'background 0.18s' }}
            >
              확인 완료
            </button>
            <button
              onClick={handleRetry}
              style={{ flex: 1, padding: '20px 0', borderRadius: 20, border: 'none', background: '#444', color: 'white', fontWeight: 700, fontSize: 20, cursor: 'pointer', transition: 'background 0.18s' }}
            >
              다시 하기
            </button>
          </div>
        )}
        {/* 마이크 레벨 바: 카드 하단 */}
        <div style={{ width: '100%', marginTop: 40 }}>
          <div style={{
            width: '100%',
            height: 18,
            borderRadius: 9,
            background: '#e6f9f3',
            overflow: 'hidden',
            boxShadow: '0 2px 12px #30C59B22'
          }}>
            <div style={{
              width: `${Math.min(micLevel * 3, 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #30C59B 60%, #6ee7b7 100%)',
              borderRadius: 9,
              transition: 'width 0.15s'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewEnvironmentCheck; 
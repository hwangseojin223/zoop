import React, { useEffect, useState } from 'react';

export default function MatchingDetailModal({ open, onClose, candPortfolioId, postId }) {
  const [portfolio, setPortfolio] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [jobCandidateId, setJobCandidateId] = useState(null);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (!open) return;
    console.log('MatchingDetailModal props:', { candPortfolioId, postId });
    if (candPortfolioId == null || postId == null) {
      setError('필수 정보가 누락되었습니다.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    
    // 매칭 정보와 함께 jobCandidateId도 가져오기
    Promise.all([
      fetch(`http://localhost:8081/api/portfolio-job-matches/portfolio/${candPortfolioId}/post/${postId}`)
        .then(r => r.ok ? r.json() : null),
      fetch(`http://localhost:8081/api/progress/${postId}/portfolio/${candPortfolioId}/job-candidate-id`)
        .then(r => r.ok ? r.json() : null)
        .catch(() => null) // jobCandidateId가 없을 수 있음
    ])
    .then(([matchData, jobCandidateResponse]) => {
      setMatch(matchData);
      if (jobCandidateResponse && jobCandidateResponse.jobCandidateId) {
        setJobCandidateId(jobCandidateResponse.jobCandidateId);
      }
      setLoading(false);
    })
    .catch(e => {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    });
  }, [open, candPortfolioId, postId]);

  // 매칭 이유를 파싱하여 구조화된 데이터로 변환
  const parseMatchingReason = (reason) => {
    if (!reason) return null;
    
    console.log('파싱 시작 - 원본 텍스트:', reason);
    
    const lines = reason.split('\n');
    const result = {
      technicalMatch: { score: 0, reason: '' },
      experienceMatch: { score: 0, reason: '' },
      projectMatch: { score: 0, reason: '' },
      growthPotential: { score: 0, reason: '' }
    };
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      console.log(`라인 ${index}: "${trimmedLine}"`);
      
      // 기술 스택 일치도 파싱
      if (trimmedLine.includes('기술 스택 일치도') || trimmedLine.includes('기술 스택')) {
        const match = trimmedLine.match(/(\d+)점/);
        if (match) {
          result.technicalMatch.score = parseInt(match[1]);
          console.log('기술 스택 점수 찾음:', result.technicalMatch.score);
        }
        const reasonPart = trimmedLine.split('-')[1] || trimmedLine.split('점')[1];
        if (reasonPart) result.technicalMatch.reason = reasonPart.trim();
      }
      
      // 경력 수준 적합성 파싱
      else if (trimmedLine.includes('경력 수준 적합성') || trimmedLine.includes('경력 수준')) {
        const match = trimmedLine.match(/(\d+)점/);
        if (match) {
          result.experienceMatch.score = parseInt(match[1]);
          console.log('경력 수준 점수 찾음:', result.experienceMatch.score);
        }
        const reasonPart = trimmedLine.split('-')[1] || trimmedLine.split('점')[1];
        if (reasonPart) result.experienceMatch.reason = reasonPart.trim();
      }
      
      // 프로젝트 경험 관련성 파싱
      else if (trimmedLine.includes('프로젝트 경험 관련성') || trimmedLine.includes('프로젝트 경험')) {
        const match = trimmedLine.match(/(\d+)점/);
        if (match) {
          result.projectMatch.score = parseInt(match[1]);
          console.log('프로젝트 경험 점수 찾음:', result.projectMatch.score);
        }
        const reasonPart = trimmedLine.split('-')[1] || trimmedLine.split('점')[1];
        if (reasonPart) result.projectMatch.reason = reasonPart.trim();
      }
      
      // 성장 가능성 파싱
      else if (trimmedLine.includes('성장 가능성')) {
        const match = trimmedLine.match(/(\d+)점/);
        if (match) {
          result.growthPotential.score = parseInt(match[1]);
          console.log('성장 가능성 점수 찾음:', result.growthPotential.score);
        }
        const reasonPart = trimmedLine.split('-')[1] || trimmedLine.split('점')[1];
        if (reasonPart) result.growthPotential.reason = reasonPart.trim();
      }
    });
    
    console.log('최종 파싱 결과:', result);
    return result;
  };

  // 면접초대 함수
  const handleInterviewInvitation = async () => {
    if (!jobCandidateId) {
      alert('후보자 정보를 찾을 수 없습니다.');
      return;
    }

    setInviting(true);
    try {
      const response = await fetch(`http://localhost:8081/api/progress/${jobCandidateId}/update-stage-2p`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        alert('면접초대가 성공적으로 전송되었습니다.');
        onClose(); // 모달 닫기
      } else {
        const errorData = await response.text();
        alert(`면접초대 전송 실패: ${errorData}`);
      }
    } catch (error) {
      console.error('면접초대 전송 중 오류:', error);
      alert('면접초대 전송 중 오류가 발생했습니다.');
    } finally {
      setInviting(false);
    }
  };

  // 원형 프로그레스 바 컴포넌트
  const CircularProgress = ({ score, size = 60, strokeWidth = 6, color = "#30c59b" }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = (score / 100) * circumference;
    const remaining = circumference - progress;
    
    return (
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* 배경 원 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* 진행 원 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={remaining}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: size * 0.3,
          fontWeight: 800,
          color: '#1a202c'
        }}>
          {score}
        </div>
      </div>
    );
  };

  // 막대 그래프 컴포넌트
  const BarChart = ({ data }) => {
    // 각 항목별 할당된 점수 정의
    const maxScores = {
      technicalMatch: 30,    // 기술 스택: 30점 할당
      experienceMatch: 25,   // 경력 수준: 25점 할당
      projectMatch: 25,      // 프로젝트 경험: 25점 할당
      growthPotential: 20    // 성장 가능성: 20점 할당
    };
    
    return (
      <div style={{ marginTop: '20px' }}>
        {Object.entries(data).map(([key, item]) => {
          const maxScore = maxScores[key];
          const percentage = (item.score / maxScore) * 100;
          
          return (
            <div key={key} style={{ marginBottom: '20px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <span style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: 600, 
                  color: '#374151',
                  minWidth: '120px'
                }}>
                  {key === 'technicalMatch' ? '기술 스택' :
                   key === 'experienceMatch' ? '경력 수준' :
                   key === 'projectMatch' ? '프로젝트 경험' :
                   key === 'growthPotential' ? '성장 가능성' : key}
                </span>
                <span style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: 700, 
                  color: '#1a202c',
                  minWidth: '40px',
                  textAlign: 'right'
                }}>
                  {item.score}점
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '14px',
                background: '#e2e8f0',
                borderRadius: '7px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  width: `${percentage}%`,
                  height: '100%',
                  background: percentage >= 80 ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)' :
                             percentage >= 60 ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)' :
                             'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
                  borderRadius: '7px',
                  transition: 'width 1s ease-in-out',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                  position: 'relative'
                }}>
                  {/* 막대 위에 점수 표시 */}
                  <div style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: 'white',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                  }}>
                    {item.score}/{maxScore}
                  </div>
                </div>
              </div>
              {item.reason && (
                <div style={{
                  fontSize: '0.8rem',
                  color: '#6b7280',
                  marginTop: '8px',
                  lineHeight: 1.4,
                  paddingLeft: '4px',
                  fontStyle: 'italic'
                }}>
                  {item.reason}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // 레이더 차트 컴포넌트
  const RadarChart = ({ data }) => {
    const categories = [
      { key: 'technicalMatch', label: '기술 스택', color: '#3b82f6' },
      { key: 'experienceMatch', label: '경력 수준', color: '#10b981' },
      { key: 'projectMatch', label: '프로젝트', color: '#f59e0b' },
      { key: 'growthPotential', label: '성장 가능성', color: '#8b5cf6' }
    ];
    
    const size = 300;
    const center = size / 2;
    const radius = 100;
    
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginTop: '20px',
        position: 'relative',
        width: '100%',
        height: 'auto',
        padding: '40px',
        overflow: 'visible' // 오버플로우 허용
      }}>
        {/* SVG 차트 */}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* 배경 그리드 */}
          {[20, 40, 60, 80, 100].map(level => (
            <circle
              key={level}
              cx={center}
              cy={center}
              r={(level / 100) * radius}
              stroke="#e2e8f0"
              strokeWidth="1"
              fill="transparent"
              opacity="0.5"
            />
          ))}
          
          {/* 축선 */}
          {categories.map((category, index) => {
            const angle = (index * 90 - 90) * (Math.PI / 180);
            const x = center + Math.cos(angle) * radius;
            const y = center + Math.sin(angle) * radius;
            
            return (
              <line
                key={category.key}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1.5"
                opacity="0.6"
              />
            );
          })}
          
          {/* 데이터 폴리곤 */}
          <polygon
            points={categories.map((category, index) => {
              const angle = (index * 90 - 90) * (Math.PI / 180);
              const score = data[category.key]?.score || 0;
              const r = (score / 100) * radius;
              const x = center + Math.cos(angle) * r;
              const y = center + Math.sin(angle) * r;
              return `${x},${y}`;
            }).join(' ')}
            fill="rgba(48, 197, 155, 0.15)"
            stroke="#30c59b"
            strokeWidth="2.5"
            opacity="0.9"
          />
          
          {/* 데이터 포인트 */}
          {categories.map((category, index) => {
            const angle = (index * 90 - 90) * (Math.PI / 180);
            const score = data[category.key]?.score || 0;
            const r = (score / 100) * radius;
            const x = center + Math.cos(angle) * r;
            const y = center + Math.sin(angle) * r;
            
            return (
              <circle
                key={category.key}
                cx={x}
                cy={y}
                r="5"
                fill={category.color}
                stroke="white"
                strokeWidth="2"
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
              />
            );
          })}
          
          {/* 점수 라벨 (각 점 위에 표시) */}
          {categories.map((category, index) => {
            const angle = (index * 90 - 90) * (Math.PI / 180);
            const score = data[category.key]?.score || 0;
            const r = (score / 100) * radius;
            const x = center + Math.cos(angle) * r;
            const y = center + Math.sin(angle) * r;
            
            return (
              <text
                key={`label-${category.key}`}
                x={x}
                y={y - 15}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="#1a202c"
                style={{ userSelect: 'none' }}
              >
                {score}점
              </text>
            );
          })}
        </svg>
        
        {/* 축 라벨을 HTML div로 절대 위치에 배치 */}
        {categories.map((category, index) => {
          const angle = (index * 90 - 90) * (Math.PI / 180);
          const x = center + Math.cos(angle) * (radius + 50);
          const y = center + Math.sin(angle) * (radius + 50);
          
          // 각 축별로 오른쪽으로 조정
          let rightOffset = 0;
          if (index === 0) rightOffset = 15;      // 기술 스택 (위쪽)
          else if (index === 1) rightOffset = 20; // 경력 수준 (오른쪽)
          else if (index === 2) rightOffset = 15; // 프로젝트 (아래쪽)
          else if (index === 3) rightOffset = 25; // 성장 가능성 (왼쪽)
          
          // 각 축별로 아래쪽으로 조정
          let downOffset = 0;
          if (index === 0) downOffset = 10;      // 기술 스택 (위쪽)
          else if (index === 1) downOffset = 5;  // 경력 수준 (오른쪽)
          else if (index === 2) downOffset = 15; // 프로젝트 (아래쪽)
          else if (index === 3) downOffset = 5;  // 성장 가능성 (왼쪽)
          
          return (
            <div
              key={`axis-${category.key}`}
              style={{
                position: 'absolute',
                left: `${x + 20 + rightOffset}px`, // SVG 위치 + 오프셋 + 오른쪽 조정
                top: `${y + 20 + downOffset}px`, // SVG 위치 + 오프셋 + 아래쪽 조정
                transform: 'translate(-50%, -50%)',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                backgroundColor: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                whiteSpace: 'nowrap',
                zIndex: 10,
                userSelect: 'none'
              }}
            >
              {category.label}
            </div>
          );
        })}
      </div>
    );
  };

  if (!open) return null;

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        background: 'rgba(0,0,0,0.6)', 
        zIndex: 2000, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backdropFilter: 'blur(8px)'
      }} 
      onClick={onClose}
    >
      <div 
        style={{ 
          maxWidth: 1000, 
          width: '95vw', 
          maxHeight: '90vh',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
          borderRadius: 24, 
          boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 8px 32px rgba(0,0,0,0.1)', 
          padding: '3rem 3rem 2.5rem 3rem', 
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.2)'
        }} 
        onClick={e => e.stopPropagation()}
      >
        {/* 상단 그라데이션 바 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #30c59b 0%, #22c55e 50%, #16a34a 100%)',
          borderRadius: '24px 24px 0 0'
        }} />
        
        {/* 닫기 버튼 */}
        <button 
          onClick={onClose} 
          style={{ 
            position: 'absolute', 
            top: 24, 
            right: 24, 
            background: 'rgba(255,255,255,0.9)', 
            border: '1px solid rgba(0,0,0,0.1)', 
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            fontSize: 20, 
            color: '#666', 
            cursor: 'pointer', 
            fontWeight: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={e => {
            e.target.style.background = 'rgba(255,255,255,1)';
            e.target.style.transform = 'scale(1.1)';
            e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={e => {
            e.target.style.background = 'rgba(255,255,255,0.9)';
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }}
        >
          ×
        </button>

        {/* 헤더 */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <h1 style={{ 
            color: '#1a202c', 
            fontWeight: 800, 
            fontSize: '2.2rem', 
            marginBottom: 8,
            background: 'linear-gradient(135deg, #30c59b 0%, #22c55e 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            매칭 상세 결과
          </h1>
          <p style={{ 
            color: '#64748b', 
            fontSize: '1rem', 
            margin: 0,
            fontWeight: 500
          }}>
            AI 분석을 통한 정확한 매칭 정보를 확인하세요
          </p>
        </div>

        {loading ? (
          <div style={{ 
            padding: 60, 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #30c59b',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <div style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>
              매칭 정보를 불러오는 중...
            </div>
          </div>
        ) : error ? (
          <div style={{ 
            padding: 40, 
            color: '#dc2626', 
            textAlign: 'center',
            background: '#fef2f2',
            borderRadius: 16,
            border: '1px solid #fecaca'
          }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 8 }}>
              ⚠️ 오류가 발생했습니다
            </div>
            {error}
          </div>
        ) : (
          <div style={{ maxHeight: 'calc(90vh - 200px)', overflowY: 'auto', paddingRight: '8px' }}>
            {/* 매칭 점수 및 이유 섹션 */}
            <section style={{ marginBottom: 32 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                marginBottom: 20 
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #30c59b 0%, #22c55e 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M9 12l2 2 4-4"/>
                    <path d="M21 12c-1 0-2-.5-2-1.5s1-1.5 2-1.5 2 .5 2 1.5-1 1.5-2 1.5z"/>
                    <path d="M3 12c1 0 2-.5 2-1.5S4 9 3 9s-2 .5-2 1.5 1 1.5 2 1.5z"/>
                  </svg>
                </div>
                <h2 style={{ 
                  color: '#1a202c', 
                  fontWeight: 700, 
                  fontSize: '1.4rem', 
                  margin: 0 
                }}>
                  매칭 점수 및 이유
                </h2>
              </div>
              
              {(() => {
                const score = match?.matchScore ?? match?.MATCHING_SCORE ?? match?.matchingScore;
                const reason = match?.matchReason ?? match?.MATCHING_REASON ?? match?.matchingReason;
                const parsedData = parseMatchingReason(reason);
                
                // 디버깅을 위한 로그
                console.log('원본 매칭 데이터:', match);
                console.log('원본 점수:', score);
                console.log('원본 이유:', reason);
                console.log('파싱된 데이터:', parsedData);
                
                // 파싱된 데이터가 있으면 totalScore를 우선 사용
                const finalScore = parsedData?.totalScore || score;
                
                console.log('최종 사용할 점수:', finalScore);
                
                return finalScore !== undefined ? (
                  <div style={{ 
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
                    borderRadius: 20, 
                    padding: '28px 24px',
                    border: '1px solid rgba(48, 197, 155, 0.2)',
                    boxShadow: '0 4px 20px rgba(48, 197, 155, 0.08)'
                  }}>
                    {/* 전체 점수 표시 */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '24px', 
                      marginBottom: '32px',
                      padding: '24px 28px',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                      borderRadius: 20,
                      border: '2px solid rgba(48, 197, 155, 0.3)',
                      boxShadow: '0 8px 32px rgba(48, 197, 155, 0.1)'
                    }}>
                      <CircularProgress 
                        score={finalScore} 
                        size={80} 
                        strokeWidth={8}
                        color={finalScore >= 80 ? '#10b981' : finalScore >= 60 ? '#f59e0b' : '#ef4444'}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontSize: '1.3rem', 
                          fontWeight: 700, 
                          color: '#1a202c',
                          marginBottom: '8px'
                        }}>
                          종합 매칭 점수
                        </div>
                        <div style={{ 
                          fontSize: '1rem', 
                          color: '#64748b',
                          marginBottom: '16px'
                        }}>
                          {finalScore >= 80 ? '🎯 매우 우수한 매칭' : 
                           finalScore >= 60 ? '✅ 양호한 매칭' : '⚠️ 개선이 필요한 매칭'}
                        </div>
                        <div style={{
                          background: 'rgba(48, 197, 155, 0.1)',
                          padding: '8px 16px',
                          borderRadius: 12,
                          border: '1px solid rgba(48, 197, 155, 0.3)',
                          display: 'inline-block'
                        }}>
                          <span style={{ 
                            fontSize: '0.9rem', 
                            fontWeight: 600, 
                            color: '#166534' 
                          }}>
                            📊 AI 분석 기반 종합 평가
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 상세 분석 차트들 */}
                    {parsedData && (
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '24px',
                        marginBottom: '24px'
                      }}>
                        {/* 막대 그래프 */}
                        <div style={{
                          background: '#ffffff',
                          borderRadius: 16,
                          padding: '20px',
                          border: '1px solid rgba(0,0,0,0.08)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                          <div style={{
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: '#1a202c',
                            marginBottom: '16px',
                            textAlign: 'center'
                          }}>
                            📊 세부 항목별 점수
                          </div>
                          <BarChart data={parsedData} />
                        </div>
                        
                        {/* 레이더 차트 */}
                        <div style={{
                          background: '#ffffff',
                          borderRadius: 16,
                          padding: '20px',
                          border: '1px solid rgba(0,0,0,0.08)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                          <div style={{
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: '#1a202c',
                            marginBottom: '16px',
                            textAlign: 'center'
                          }}>
                            🎯 역량 레이더 차트
                          </div>
                          <RadarChart data={parsedData} />
                        </div>
                      </div>
                    )}
                    
                    {/* 원본 매칭 이유 (접을 수 있게) */}
                    <details style={{ marginTop: '20px' }}>
                      <summary style={{
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: '#6b7280',
                        padding: '12px 16px',
                        background: '#f8fafc',
                        borderRadius: 12,
                        border: '1px solid #e2e8f0',
                        userSelect: 'none'
                      }}>
                        📋 원본 매칭 이유 상세보기
                      </summary>
                      <div style={{ 
                        background: '#ffffff', 
                        borderRadius: 12, 
                        padding: '16px 20px',
                        fontSize: '0.9rem',
                        lineHeight: 1.7,
                        color: '#374151',
                        border: '1px solid rgba(0,0,0,0.08)',
                        marginTop: '8px',
                        maxHeight: '200px',
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap',
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
                      }}>
                        {reason || '매칭 이유 정보를 찾을 수 없습니다.'}
                      </div>
                    </details>
                  </div>
                ) : (
                  <div style={{ 
                    padding: '40px 24px', 
                    textAlign: 'center',
                    color: '#64748b',
                    background: '#f8fafc',
                    borderRadius: 16,
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '1.1rem', marginBottom: '8px' }}>
                      📊 매칭 정보 없음
                    </div>
                    <div style={{ fontSize: '0.9rem' }}>
                      매칭 점수 및 이유 정보를 찾을 수 없습니다.
                    </div>
                  </div>
                );
              })()}
            </section>

            {/* 면접 관리 */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              marginTop: '24px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                color: '#1a202c',
                margin: '0 0 20px 0',
                fontSize: '18px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '20px' }}>🎯</span>
                면접 관리
              </h3>
              
              <button
                onClick={handleInterviewInvitation}
                disabled={inviting || !jobCandidateId}
                style={{
                  background: jobCandidateId 
                    ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' 
                    : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: jobCandidateId ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  boxShadow: jobCandidateId 
                    ? '0 4px 12px rgba(34, 197, 94, 0.3)' 
                    : '0 2px 8px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: 'fit-content'
                }}
                onMouseEnter={(e) => {
                  if (jobCandidateId) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (jobCandidateId) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)';
                  }
                }}
              >
                {inviting ? (
                  <>
                    <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                    면접초대 전송 중...
                  </>
                ) : (
                  <>
                    <span>📧</span>
                    면접초대 보내기
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          /* 스크롤바 스타일링 */
          ::-webkit-scrollbar {
            width: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}</style>
      </div>
    </div>
  );
} 
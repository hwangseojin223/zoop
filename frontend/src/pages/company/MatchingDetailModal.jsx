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
    
    console.log('파싱 결과:', result);
    return result;
  };

  const handleInterviewInvitation = async () => {
    if (!jobCandidateId) {
      alert('면접 초대를 보낼 수 없습니다. 후보자 정보를 확인해주세요.');
      return;
    }

    setInviting(true);
    try {
      const response = await fetch(`http://localhost:8081/api/interview-schedule/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobCandidateId: jobCandidateId,
          postId: postId,
          message: '면접에 초대합니다.'
        })
      });

      if (response.ok) {
        alert('면접 초대가 성공적으로 전송되었습니다.');
        onClose();
      } else {
        throw new Error('면접 초대 전송 실패');
      }
    } catch (error) {
      console.error('면접 초대 오류:', error);
      alert('면접 초대 전송 중 오류가 발생했습니다.');
    } finally {
      setInviting(false);
    }
  };

  if (!open) return null;

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div>
          <div>데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '16px', color: '#ef4444' }}>❌</div>
          <div style={{ marginBottom: '24px', color: '#374151' }}>{error}</div>
          <button
            onClick={onClose}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  const parsedReason = parseMatchingReason(match?.matchingReason);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto',
        width: '90%'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            margin: 0,
            color: '#1f2937',
            fontSize: '24px',
            fontWeight: '600'
          }}>
            매칭 상세 정보
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        {match && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <h3 style={{
                color: '#0c4a6e',
                margin: '0 0 16px 0',
                fontSize: '18px',
                fontWeight: '600'
              }}>
                매칭 점수: {match.matchingScore}점
              </h3>
              
              {parsedReason && (
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div style={{
                    background: 'white',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #e0f2fe'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '8px', color: '#0c4a6e' }}>
                      기술 스택 일치도: {parsedReason.technicalMatch.score}점
                    </div>
                    {parsedReason.technicalMatch.reason && (
                      <div style={{ fontSize: '14px', color: '#374151' }}>
                        {parsedReason.technicalMatch.reason}
                      </div>
                    )}
                  </div>
                  
                  <div style={{
                    background: 'white',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #e0f2fe'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '8px', color: '#0c4a6e' }}>
                      경력 수준 적합성: {parsedReason.experienceMatch.score}점
                    </div>
                    {parsedReason.experienceMatch.reason && (
                      <div style={{ fontSize: '14px', color: '#374151' }}>
                        {parsedReason.experienceMatch.reason}
                      </div>
                    )}
                  </div>
                  
                  <div style={{
                    background: 'white',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #e0f2fe'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '8px', color: '#0c4a6e' }}>
                      프로젝트 경험 관련성: {parsedReason.projectMatch.score}점
                    </div>
                    {parsedReason.projectMatch.reason && (
                      <div style={{ fontSize: '14px', color: '#374151' }}>
                        {parsedReason.projectMatch.reason}
                      </div>
                    )}
                  </div>
                  
                  <div style={{
                    background: 'white',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #e0f2fe'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '8px', color: '#0c4a6e' }}>
                      성장 가능성: {parsedReason.growthPotential.score}점
                    </div>
                    {parsedReason.growthPotential.reason && (
                      <div style={{ fontSize: '14px', color: '#374151' }}>
                        {parsedReason.growthPotential.reason}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div style={{
              background: '#f8fafc',
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

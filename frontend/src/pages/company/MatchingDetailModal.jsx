import React, { useEffect, useState } from 'react';

export default function MatchingDetailModal({ open, onClose, candPortfolioId, postId }) {
  const [portfolio, setPortfolio] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    fetch(`http://localhost:8081/api/portfolio-job-matches/portfolio/${candPortfolioId}/post/${postId}`)
      .then(r => r.ok ? r.json() : null)
      .then(matchData => {
        setMatch(matchData);
        setLoading(false);
      })
      .catch(e => {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      });
  }, [open, candPortfolioId, postId]);

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.45)', zIndex: 2000, display:'flex', alignItems:'center', justifyContent:'center' }} onClick={onClose}>
      <div style={{ maxWidth: 800, width: '95vw', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(48,197,155,0.10)', padding: '2.5rem 2.5rem 2rem 2.5rem', position:'relative' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position:'absolute', top:18, right:18, background:'none', border:'none', fontSize:28, color:'#aaa', cursor:'pointer', fontWeight:700 }}>&times;</button>
        <h1 style={{ color: '#30c59b', fontWeight: 900, fontSize: '2rem', marginBottom: 32 }}>매칭 상세 결과</h1>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>불러오는 중...</div>
        ) : error ? (
          <div style={{ padding: 40, color: 'red', textAlign: 'center' }}>{error}</div>
        ) : (
          <>
            {/* 매칭 점수/이유만 남김 */}
            <section>
              <h2 style={{ color: '#222', fontWeight: 800, fontSize: '1.2rem', marginBottom: 12 }}>매칭 점수 및 이유</h2>
              {(() => {
                const score = match.matchScore ?? match.MATCHING_SCORE ?? match.matchingScore;
                const reason = match.matchReason ?? match.MATCHING_REASON ?? match.matchingReason;
                return score !== undefined ? (
                  <div style={{ background: '#f8fafd', borderRadius: 10, padding: 18, fontSize: 16 }}>
                    <div><b>매칭 점수:</b> <span style={{ color: '#f59e42', fontWeight: 700, fontSize: 20 }}>{score}</span></div>
                    <div style={{ marginTop: 10 }}><b>매칭 이유:</b></div>
                    <pre style={{ background: '#fff', borderRadius: 8, padding: 14, fontSize: 15, marginTop: 6, maxHeight: 200, overflow: 'auto' }}>{reason || '매칭 이유 정보 없음'}</pre>
                  </div>
                ) : <div style={{ color: '#888' }}>매칭 점수/이유 정보를 찾을 수 없습니다.</div>;
              })()}
            </section>
          </>
        )}
      </div>
    </div>
  );
} 
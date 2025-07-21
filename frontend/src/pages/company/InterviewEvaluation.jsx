import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import SEO from '../../components/SEO';

export default function InterviewEvaluation() {
  const { postId, candidateId } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [existingEvaluation, setExistingEvaluation] = useState(null);
  const [evaluation, setEvaluation] = useState({
    adminIntrvwScore: '',
    adminIntrvwNotes: '',
    adminIntrvwSlctStatus: 'pending'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCandidateData();
    fetchInterviewVideos();
    fetchAnalysisResult();
    fetchExistingEvaluation();
  }, [candidateId]);

  const fetchCandidateData = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/job-cand-progress/${candidateId}/with-candidate`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCandidate(data);
      }
    } catch (error) {
      console.error('후보자 정보 조회 실패:', error);
    }
  };

  const fetchInterviewVideos = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/interview-videos/by-job-candidate/${candidateId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setVideos(data);
      }
    } catch (error) {
      console.error('면접 영상 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysisResult = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/ai-analysis-results/type/interview`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('전체 분석 결과:', data);
        // 현재 jobCandidateId에 해당하는 분석 결과 찾기
        const result = data.find(item => item.jobCandidateId === parseInt(candidateId));
        console.log('찾은 분석 결과:', result);
        if (result) {
          setAnalysisResult(result);
        }
      }
    } catch (error) {
      console.error('면접 분석 결과 조회 실패:', error);
    }
  };

  const fetchExistingEvaluation = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/admin-interview-evaluations/${candidateId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setExistingEvaluation(data);
        // 기존 평가가 있으면 폼에 설정
        setEvaluation({
          adminIntrvwScore: data.adminIntrvwScore?.toString() || '',
          adminIntrvwNotes: data.adminIntrvwNotes || '',
          adminIntrvwSlctStatus: data.adminIntrvwSlctStatus || 'pending'
        });
      }
    } catch (error) {
      console.error('기존 평가 조회 실패:', error);
    }
  };

  // 분석 데이터 파싱 함수
  const parseAnalysisData = (analysisData) => {
    if (!analysisData) return null;
    
    try {
      // JSON 형태인 경우 파싱
      if (typeof analysisData === 'string' && analysisData.startsWith('{')) {
        const parsed = JSON.parse(analysisData);
        // JSON 내부의 analysis 필드에서 실제 분석 텍스트 추출
        const actualAnalysis = parsed.analysis || analysisData;
        
        // 텍스트 형태인 경우 파싱
        const lines = actualAnalysis.split('\n');
        const categories = [];
        let totalScore = 0;
        let overallEvaluation = '';
        
        for (const line of lines) {
          if (line.includes('점 -')) {
            const match = line.match(/(.+):\s*(\d+)점\s*-\s*(.+)/);
            if (match) {
              const category = match[1].trim();
              const score = parseInt(match[2]);
              const reason = match[3].trim();
              categories.push({ category, score, reason });
              totalScore += score;
            }
          } else if (line.includes('총점:')) {
            const match = line.match(/총점:\s*(\d+)점/);
            if (match) {
              totalScore = parseInt(match[1]);
            }
          } else if (line.includes('종합평가:')) {
            overallEvaluation = line.replace('종합평가:', '').trim();
          }
        }
        
        return {
          categories,
          totalScore,
          overallEvaluation
        };
      }
      
      // 일반 텍스트 형태인 경우 파싱
      const lines = analysisData.split('\n');
      const categories = [];
      let totalScore = 0;
      let overallEvaluation = '';
      
      for (const line of lines) {
        if (line.includes('점 -')) {
          const match = line.match(/(.+):\s*(\d+)점\s*-\s*(.+)/);
          if (match) {
            const category = match[1].trim();
            const score = parseInt(match[2]);
            const reason = match[3].trim();
            categories.push({ category, score, reason });
            totalScore += score;
          }
        } else if (line.includes('총점:')) {
          const match = line.match(/총점:\s*(\d+)점/);
          if (match) {
            totalScore = parseInt(match[1]);
          }
        } else if (line.includes('종합평가:')) {
          overallEvaluation = line.replace('종합평가:', '').trim();
        }
      }
      
      return {
        categories,
        totalScore,
        overallEvaluation
      };
    } catch (error) {
      console.error('분석 데이터 파싱 오류:', error);
      return null;
    }
  };

  const parsedAnalysis = parseAnalysisData(analysisResult?.analysisData);
  console.log('파싱된 분석 결과:', parsedAnalysis);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('http://localhost:8081/api/admin-interview-evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
        },
        body: JSON.stringify({
          jobCandidateId: parseInt(candidateId),
          evaluatedByAdminId: parseInt(localStorage.getItem('userId')),
          adminIntrvwEvaluationDate: new Date().toISOString(),
          adminIntrvwScore: parseFloat(evaluation.adminIntrvwScore),
          adminIntrvwNotes: evaluation.adminIntrvwNotes,
          adminIntrvwSlctStatus: evaluation.adminIntrvwSlctStatus
        }),
      });

      if (response.ok) {
        alert('면접 평가가 성공적으로 저장되었습니다.');
        // 기존 평가 데이터를 새로고침하여 완료된 평가 표시
        await fetchExistingEvaluation();
        // 후보자 데이터도 새로고침하여 업데이트된 stage 정보 반영
        await fetchCandidateData();
      } else {
        alert('면접 평가 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('면접 평가 저장 실패:', error);
      alert('면접 평가 저장 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'SUIT, Apple SD Gothic Neo, sans-serif' }}>
        <Navbar />
        <div style={{ padding: '7rem 3rem', textAlign: 'center' }}>
          <p>면접 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'SUIT, Apple SD Gothic Neo, sans-serif', backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <Navbar />
      <SEO
        title="면접 평가"
        description="후보자의 면접 평가를 작성하고 분석 결과를 확인할 수 있는 페이지입니다."
        keywords="면접 평가, AI 분석, 후보자 평가, 면접 결과, 면접 분석"
      />
      <div style={{ padding: '7rem 3rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem', color: '#2d3748' }}>
            면접 평가
          </h1>

          {candidate && (
            <div style={{ 
              background: '#f8fafc', 
              padding: '1.5rem', 
              borderRadius: '12px', 
              marginBottom: '2rem',
              border: '1px solid #e2e8f0'
            }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', color: '#2d3748' }}>
                후보자 정보
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <strong>GitHub:</strong> {candidate.githubLogin}
                </div>
                <div>
                  <strong>이메일:</strong> {candidate.candidateEmail}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* 면접 영상 섹션 */}
            <div style={{ 
              background: '#ffffff', 
              padding: '1.5rem', 
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', color: '#2d3748' }}>
                면접 영상
              </h2>
              {videos.length === 0 ? (
                <p style={{ color: '#718096', textAlign: 'center', padding: '2rem' }}>
                  면접 영상이 없습니다.
                </p>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {videos
                    .slice() // copy array to avoid mutating state
                    .sort((a, b) => a.questionNumber - b.questionNumber)
                    .map((video, index) => (
                      <div key={video.videoId} style={{ 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '8px', 
                        padding: '1rem' 
                      }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                          질문 {video.questionNumber}
                        </h3>
                        <p style={{ color: '#4a5568', marginBottom: '1rem' }}>
                          {video.questionContent}
                        </p>
                        <video 
                          controls 
                          style={{ width: '100%', borderRadius: '8px' }}
                          src={video.videoFilePath}
                        >
                          브라우저가 비디오를 지원하지 않습니다.
                        </video>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* AI 분석 결과 섹션 */}
            <div style={{ 
              background: '#ffffff', 
              padding: '1.5rem', 
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', color: '#2d3748' }}>
                AI 면접 분석 결과
              </h2>
              {analysisResult && parsedAnalysis ? (
                <div>
                  {/* 총점 표시 */}
                  <div style={{ 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                    color: 'white', 
                    padding: '1.5rem', 
                    borderRadius: '12px', 
                    marginBottom: '1.5rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      {parsedAnalysis.totalScore || analysisResult.analysisScore}점
                    </div>
                    <div style={{ fontSize: '1rem', opacity: 0.9 }}>
                      AI 면접 종합 평가
                    </div>
                  </div>

                  {/* 카테고리별 점수 테이블 */}
                  {parsedAnalysis.categories && parsedAnalysis.categories.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#2d3748' }}>
                        세부 평가
                      </h3>
                      <div style={{ 
                        background: '#f8fafc', 
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden'
                      }}>
                        {parsedAnalysis.categories.map((category, index) => (
                          <div key={index} style={{
                            padding: '1rem',
                            borderBottom: index < parsedAnalysis.categories.length - 1 ? '1px solid #e2e8f0' : 'none',
                            background: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                              <span style={{ fontWeight: '600', color: '#2d3748', fontSize: '0.95rem' }}>
                                {category.category}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{
                                  width: '60px',
                                  height: '8px',
                                  background: '#e2e8f0',
                                  borderRadius: '4px',
                                  overflow: 'hidden'
                                }}>
                                  <div style={{
                                    width: `${(category.score / 25) * 100}%`,
                                    height: '100%',
                                    background: category.score >= 20 ? '#48bb78' : 
                                               category.score >= 15 ? '#f6ad55' : '#e53e3e',
                                    transition: 'width 0.3s ease'
                                  }} />
                                </div>
                                <span style={{ 
                                  fontWeight: 'bold', 
                                  color: category.score >= 20 ? '#48bb78' : 
                                         category.score >= 15 ? '#f6ad55' : '#e53e3e',
                                  fontSize: '0.9rem',
                                  minWidth: '30px'
                                }}>
                                  {category.score}점
                                </span>
                              </div>
                            </div>
                            <p style={{ 
                              fontSize: '0.85rem', 
                              color: '#4a5568', 
                              lineHeight: '1.4',
                              margin: 0
                            }}>
                              {category.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 종합 평가 */}
                  {parsedAnalysis.overallEvaluation && (
                    <div style={{ 
                      background: '#f0fdf4', 
                      padding: '1rem', 
                      borderRadius: '8px',
                      border: '1px solid #bbf7d0'
                    }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#166534' }}>
                        종합 평가
                      </h3>
                      <p style={{ 
                        fontSize: '0.9rem', 
                        lineHeight: '1.5',
                        color: '#14532d',
                        margin: 0
                      }}>
                        {parsedAnalysis.overallEvaluation}
                      </p>
                    </div>
                  )}
                </div>
              ) : analysisResult ? (
                <div style={{ 
                  background: '#f8fafc', 
                  padding: '1rem', 
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#2d3748' }}>
                    상세 분석
                  </h3>
                  <div style={{ 
                    whiteSpace: 'pre-line', 
                    fontSize: '0.9rem', 
                    lineHeight: '1.5',
                    color: '#4a5568'
                  }}>
                    {analysisResult.analysisData}
                  </div>
                </div>
              ) : (
                <div style={{ 
                  color: '#718096', 
                  textAlign: 'center', 
                  padding: '2rem',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <p>AI 면접 분석 결과가 없습니다.</p>
                  <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    분석이 진행 중이거나 아직 완료되지 않았습니다.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 평가 폼 섹션 */}
          <div style={{ 
            background: '#ffffff', 
            padding: '1.5rem', 
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginTop: '2rem'
          }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', color: '#2d3748' }}>
              면접 평가
            </h2>
            
            {existingEvaluation ? (
              <div>
                <div style={{ 
                  background: '#f0fdf4', 
                  padding: '1rem', 
                  borderRadius: '8px',
                  border: '1px solid #bbf7d0',
                  marginBottom: '1.5rem'
                }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#166534' }}>
                    평가 완료
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#14532d', margin: 0 }}>
                    이 후보자에 대한 면접 평가가 이미 완료되었습니다.
                  </p>
                </div>
                
                <div style={{ 
                  background: '#f8fafc', 
                  padding: '1.5rem', 
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#2d3748' }}>
                    기존 평가 결과
                  </h3>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                      <strong>점수:</strong> {existingEvaluation.adminIntrvwScore}점
                    </div>
                    <div>
                      <strong>선정 상태:</strong> 
                      <span style={{ 
                        color: existingEvaluation.adminIntrvwSlctStatus === 'selected' ? '#059669' : '#dc2626',
                        fontWeight: '600',
                        marginLeft: '0.5rem'
                      }}>
                        {existingEvaluation.adminIntrvwSlctStatus === 'selected' ? '선정' : 
                         existingEvaluation.adminIntrvwSlctStatus === 'rejected' ? '미선정' : '검토 중'}
                      </span>
                    </div>
                    {existingEvaluation.adminIntrvwNotes && (
                      <div>
                        <strong>평가 의견:</strong>
                        <p style={{ 
                          margin: '0.5rem 0 0 0', 
                          padding: '0.75rem', 
                          background: '#ffffff', 
                          borderRadius: '4px',
                          border: '1px solid #e2e8f0',
                          fontSize: '0.9rem',
                          lineHeight: '1.4'
                        }}>
                          {existingEvaluation.adminIntrvwNotes}
                        </p>
                      </div>
                    )}
                    <div>
                      <strong>평가일:</strong> {new Date(existingEvaluation.adminIntrvwEvaluationDate).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#2d3748' }}>
                    점수 (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={evaluation.adminIntrvwScore}
                    onChange={(e) => setEvaluation({...evaluation, adminIntrvwScore: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#2d3748' }}>
                    평가 의견
                  </label>
                  <textarea
                    value={evaluation.adminIntrvwNotes}
                    onChange={(e) => setEvaluation({...evaluation, adminIntrvwNotes: e.target.value})}
                    rows="6"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      resize: 'vertical'
                    }}
                    placeholder="면접 평가 의견을 작성해주세요..."
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#2d3748' }}>
                    선정 상태
                  </label>
                  <select
                    value={evaluation.adminIntrvwSlctStatus}
                    onChange={(e) => setEvaluation({...evaluation, adminIntrvwSlctStatus: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="pending">검토 중</option>
                    <option value="selected">선정</option>
                    <option value="rejected">미선정</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => navigate('/company/dashboard')}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: '#ffffff',
                      color: '#4a5568',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: 'none',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      opacity: submitting ? 0.7 : 1
                    }}
                  >
                    {submitting ? '저장 중...' : '평가 저장'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
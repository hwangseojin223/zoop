import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './InterviewAnalysisResult.css';

const InterviewAnalysisResult = () => {
  const { scheduleId: jobCandidateId } = useParams(); // URL 파라미터명은 그대로 유지하되 실제로는 jobCandidateId
  const navigate = useNavigate();
  
  const onClose = () => {
    navigate(-1); // 이전 페이지로 돌아가기
  };
  const [analysisData, setAnalysisData] = useState(null);
  const [evaluation, setEvaluation] = useState({
    score: '',
    notes: ''
  });
  const [finalDecision, setFinalDecision] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    console.log('InterviewAnalysisResult useEffect - jobCandidateId:', jobCandidateId);
    if (jobCandidateId && jobCandidateId !== 'undefined') {
      fetchAnalysisResult();
    } else {
      console.error('jobCandidateId가 유효하지 않음:', jobCandidateId);
      setError('유효하지 않은 지원자 ID입니다.');
    }
  }, [jobCandidateId]);

  const fetchAnalysisResult = async () => {
    try {
      setLoading(true);
      // jobCandidateId로 executive_interview 타입의 AI 분석 결과 조회
      const response = await axios.get(`/api/ai-analysis-results/candidate/${jobCandidateId}/executive-interview`);
      
      if (response.data.success) {
        setAnalysisData(response.data);
      } else {
        setError('면접 분석 결과를 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('면접 분석 결과 조회 실패:', err);
      setError('면접 분석 결과 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluationSubmit = async (e) => {
    e.preventDefault();
    
    if (!evaluation.score || !evaluation.notes.trim()) {
      alert('평가 점수와 메모를 모두 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      
      // 1단계: jobCandidateId로 schedule_id 조회
      console.log('평가 저장을 위한 schedule_id 조회 시작...');
      const scheduleResponse = await axios.get(`/api/executive-interview/schedule/${jobCandidateId}`);
      
      if (!scheduleResponse.data || scheduleResponse.data.length === 0) {
        throw new Error('면접 일정을 찾을 수 없습니다.');
      }
      
      const scheduleId = scheduleResponse.data[0]?.scheduleId || scheduleResponse.data[0]?.id;
      console.log('평가 저장용 scheduleId:', scheduleId);
      
      if (!scheduleId) {
        throw new Error('면접 일정 ID를 찾을 수 없습니다.');
      }
      
      // 2단계: schedule_id로 평가 결과 저장
      const evaluationResponse = await axios.post('/api/executive-interview/results', {
        scheduleId: parseInt(scheduleId),
        evaluationScore: parseFloat(evaluation.score),
        evaluationNotes: evaluation.notes,
        finalDecision: null
      });

      if (evaluationResponse.data.success) {
        alert('평가가 성공적으로 저장되었습니다.');
        fetchAnalysisResult(); // 데이터 새로고침
      }
    } catch (err) {
      console.error('평가 저장 실패:', err);
      alert(`평가 저장 실패: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleFinalDecision = async (decision) => {
    if (!decision || !evaluation.notes.trim()) {
      alert('평가 메모를 먼저 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      
      // 1단계: jobCandidateId로 schedule_id 조회
      console.log('schedule_id 조회 시작...');
      const scheduleResponse = await axios.get(`/api/executive-interview/schedule/${jobCandidateId}`);
      
      if (!scheduleResponse.data || scheduleResponse.data.length === 0) {
        throw new Error('면접 일정을 찾을 수 없습니다.');
      }
      
      const scheduleId = scheduleResponse.data[0]?.scheduleId || scheduleResponse.data[0]?.id;
      console.log('찾은 scheduleId:', scheduleId);
      
      if (!scheduleId) {
        throw new Error('면접 일정 ID를 찾을 수 없습니다.');
      }
      
      // 2단계: schedule_id로 final-decision API 호출
      const response = await axios.post(`/api/executive-interview/results/${scheduleId}/final-decision`, {
        decision: decision,
        notes: evaluation.notes
      });

      if (response.data.success) {
        alert(`최종 ${decision === 'PASS' ? '합격' : '불합격'} 결정이 완료되었습니다.`);
        setFinalDecision(decision);
        fetchAnalysisResult(); // 데이터 새로고침
      }
    } catch (err) {
      console.error('최종 결정 실패:', err);
      alert(`최종 결정 실패: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const parseAnalysisData = (analysisData) => {
    try {
      if (typeof analysisData === 'string') {
        return JSON.parse(analysisData);
      }
      return analysisData;
    } catch (e) {
      console.error('분석 데이터 파싱 실패:', e);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="interview-analysis-modal">
        <div className="modal-content">
          <div className="loading">면접 분석 결과를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="interview-analysis-modal">
        <div className="modal-content">
          <div className="error">{error}</div>
          <button onClick={onClose} className="close-btn">닫기</button>
        </div>
      </div>
    );
  }

  // 디버깅을 위한 로그 추가
  console.log('전체 analysisData:', analysisData);
  console.log('aiAnalysisResult:', analysisData?.aiAnalysisResult);
  
  const parsedData = analysisData?.aiAnalysisResult ? 
    parseAnalysisData(analysisData.aiAnalysisResult) : null;
    
  console.log('파싱된 데이터:', parsedData);

  return (
    <div className="interview-analysis-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>면접 분석 결과</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="analysis-content">
          {/* AI 분석 결과 */}
          <div className="analysis-section">
            <h3>AI 분석 결과</h3>
            {parsedData ? (
              <div className="ai-analysis">
                <div className="transcription">
                  <h4>음성 변환 결과</h4>
                  {parsedData.transcription_segments && parsedData.transcription_segments.length > 0 ? (
                    parsedData.transcription_segments.map((segment, index) => (
                      <div key={index} className="segment">
                        <span className="time">
                          {segment.start.toFixed(2)}s - {segment.end.toFixed(2)}s
                        </span>
                        <span className="text">{segment.text}</span>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">
                      <p>음성 변환 결과가 없습니다.</p>
                      <p style={{fontSize: '0.9rem', color: '#666'}}>
                        원본 데이터: {JSON.stringify(parsedData, null, 2)}
                      </p>
                    </div>
                  )}
                </div>
                
                {parsedData.speaker_diarization && (
                  <div className="speaker-analysis">
                    <h4>화자 분석</h4>
                    <pre>{JSON.stringify(parsedData.speaker_diarization, null, 2)}</pre>
                  </div>
                )}
                
                <div className="analysis-meta">
                  <p>분석 시간: {parsedData.analysis_timestamp || '시간 정보 없음'}</p>
                  <p>전체 분석 데이터: {JSON.stringify(parsedData, null, 2)}</p>
                </div>
              </div>
            ) : (
              <div className="no-data">AI 분석 결과가 없습니다.</div>
            )}
          </div>

          {/* 임원 평가 */}
          <div className="evaluation-section">
            <h3>임원 평가</h3>
            
            <form onSubmit={handleEvaluationSubmit} className="evaluation-form">
              <div className="form-group">
                <label htmlFor="score">평가 점수 (1-10)</label>
                <input
                  type="number"
                  id="score"
                  min="1"
                  max="10"
                  step="0.1"
                  value={evaluation.score}
                  onChange={(e) => setEvaluation({...evaluation, score: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">평가 메모</label>
                <textarea
                  id="notes"
                  rows="4"
                  value={evaluation.notes}
                  onChange={(e) => setEvaluation({...evaluation, notes: e.target.value})}
                  placeholder="지원자의 면접 성과에 대한 평가를 작성해주세요..."
                  required
                />
              </div>
              
              <button type="submit" disabled={saving} className="submit-btn">
                {saving ? '저장 중...' : '평가 저장'}
              </button>
            </form>

            {/* 최종 결정 */}
            {evaluation.notes && (
              <div className="final-decision">
                <h4>최종 결정</h4>
                <div className="decision-buttons">
                  <button
                    onClick={() => handleFinalDecision('PASS')}
                    disabled={saving || finalDecision === 'PASS'}
                    className={`decision-btn pass ${finalDecision === 'PASS' ? 'selected' : ''}`}
                  >
                    합격 (6y)
                  </button>
                  <button
                    onClick={() => handleFinalDecision('FAIL')}
                    disabled={saving || finalDecision === 'FAIL'}
                    className={`decision-btn fail ${finalDecision === 'FAIL' ? 'selected' : ''}`}
                  >
                    불합격 (6n)
                  </button>
                </div>
                
                {finalDecision && (
                  <div className="decision-result">
                    최종 결정: <strong>{finalDecision === 'PASS' ? '합격 (6y)' : '불합격 (6n)'}</strong>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewAnalysisResult; 
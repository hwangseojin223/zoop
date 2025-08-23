import React, { useState, useEffect } from 'react';
import './ExecutiveInterviewAnalysisView.css';

const ExecutiveInterviewAnalysisView = ({ scheduleId, onClose }) => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluation, setEvaluation] = useState({
    overallScore: 0,
    communicationScore: 0,
    technicalScore: 0,
    personalityScore: 0,
    decision: 'PENDING', // PASS, FAIL, PENDING
    feedback: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (scheduleId) {
      fetchAnalysisResult();
    }
  }, [scheduleId]);

  const fetchAnalysisResult = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8081/api/executive-interview/analysis/${scheduleId}`);
      
      if (response.ok) {
        const data = await response.json();
        setAnalysisResult(data);
      } else {
        console.error('분석 결과 조회 실패:', response.status);
      }
    } catch (error) {
      console.error('분석 결과 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluationChange = (field, value) => {
    setEvaluation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitEvaluation = async () => {
    try {
      setSaving(true);
      
      const response = await fetch(`http://localhost:8081/api/executive-interview/evaluation/${scheduleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(evaluation)
      });

      if (response.ok) {
        alert('평가가 성공적으로 저장되었습니다.');
        onClose();
      } else {
        alert('평가 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('평가 저장 오류:', error);
      alert('평가 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="analysis-view-overlay">
        <div className="analysis-view-modal">
          <div className="loading">분석 결과를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="analysis-view-overlay">
        <div className="analysis-view-modal">
          <div className="error">분석 결과를 찾을 수 없습니다.</div>
          <button onClick={onClose} className="close-btn">닫기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-view-overlay">
      <div className="analysis-view-modal">
        <div className="modal-header">
          <h2>면접 AI 분석 결과</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="modal-content">
          {/* 기본 정보 */}
          <div className="section">
            <h3>기본 정보</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>면접 일시:</label>
                <span>{new Date(analysisResult.interviewDate).toLocaleString()}</span>
              </div>
              <div className="info-item">
                <label>녹화 시간:</label>
                <span>{formatTime(analysisResult.recordingDuration || 0)}</span>
              </div>
              <div className="info-item">
                <label>언어:</label>
                <span>{analysisResult.language || '한국어'}</span>
              </div>
            </div>
          </div>

          {/* 전체 대화 내용 */}
          <div className="section">
            <h3>전체 대화 내용</h3>
            <div className="transcription-text">
              {analysisResult.transcriptionText}
            </div>
          </div>

          {/* 화자별 대화 분석 */}
          {analysisResult.speakerDiarization && analysisResult.speakerDiarization.length > 0 && (
            <div className="section">
              <h3>화자별 대화 분석</h3>
              <div className="speaker-analysis">
                {analysisResult.speakerDiarization.map((segment, index) => (
                  <div key={index} className="speaker-segment">
                    <div className="speaker-info">
                      <span className="speaker-label">{segment.speaker}</span>
                      <span className="time-range">
                        {formatTime(segment.start)} - {formatTime(segment.end)}
                      </span>
                    </div>
                    <div className="segment-content">
                      {/* 해당 시간대의 텍스트 찾기 */}
                      {analysisResult.transcriptionSegments
                        ?.filter(seg => seg.start >= segment.start && seg.end <= segment.end)
                        ?.map((seg, segIndex) => (
                          <div key={segIndex} className="segment-text">
                            {seg.text}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 평가 및 합불 판정 */}
          <div className="section">
            <h3>면접 평가 및 합불 판정</h3>
            <div className="evaluation-form">
              <div className="score-inputs">
                <div className="score-item">
                  <label>종합 점수 (0-100):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={evaluation.overallScore}
                    onChange={(e) => handleEvaluationChange('overallScore', parseInt(e.target.value))}
                  />
                </div>
                <div className="score-item">
                  <label>의사소통 능력 (0-100):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={evaluation.communicationScore}
                    onChange={(e) => handleEvaluationChange('communicationScore', parseInt(e.target.value))}
                  />
                </div>
                <div className="score-item">
                  <label>기술적 역량 (0-100):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={evaluation.technicalScore}
                    onChange={(e) => handleEvaluationChange('technicalScore', parseInt(e.target.value))}
                  />
                </div>
                <div className="score-item">
                  <label>인성 및 적합성 (0-100):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={evaluation.personalityScore}
                    onChange={(e) => handleEvaluationChange('personalityScore', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="decision-section">
                <label>최종 합불 판정:</label>
                <select
                  value={evaluation.decision}
                  onChange={(e) => handleEvaluationChange('decision', e.target.value)}
                >
                  <option value="PENDING">검토 중</option>
                  <option value="PASS">합격</option>
                  <option value="FAIL">불합격</option>
                </select>
              </div>

              <div className="feedback-section">
                <label>평가 피드백:</label>
                <textarea
                  value={evaluation.feedback}
                  onChange={(e) => handleEvaluationChange('feedback', e.target.value)}
                  placeholder="면접에 대한 종합적인 평가와 피드백을 작성해주세요..."
                  rows="4"
                />
              </div>

              <div className="action-buttons">
                <button
                  onClick={handleSubmitEvaluation}
                  disabled={saving}
                  className="submit-btn"
                >
                  {saving ? '저장 중...' : '평가 저장'}
                </button>
                <button onClick={onClose} className="cancel-btn">
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveInterviewAnalysisView; 
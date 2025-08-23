import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ExecutiveInterviewManagement.css';
import ExecutiveInterviewSession from '../../components/ExecutiveInterviewSession';
import InterviewAnalysisResult from './InterviewAnalysisResult';

const ExecutiveInterviewManagement = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    interviewDate: '',
    timeSlot: '',
    notes: ''
  });
  
  const [analysisForm, setAnalysisForm] = useState({
    s3Key: '',
    jobDescription: '',
    candidateProfile: ''
  });
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [showInterviewSession, setShowInterviewSession] = useState(false);
  const [showAnalysisResult, setShowAnalysisResult] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);

  // 회사 ID (실제로는 인증 컨텍스트에서 가져와야 함)
  const companyId = 1; // 임시 값

  useEffect(() => {
    fetch4yCandidates();
  }, []);

  const fetch4yCandidates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/executive-interview/candidates?companyId=${companyId}`);
      setCandidates(response.data);
      setError(null);
    } catch (err) {
      console.error('4y 상태 지원자 조회 실패:', err);
      setError('지원자 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInterview = (candidate) => {
    setSelectedCandidate(candidate);
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    
    if (!scheduleForm.interviewDate || !scheduleForm.timeSlot) {
      alert('면접 일정과 시간을 입력해주세요.');
      return;
    }

    try {
      const scheduleData = {
        jobCandidateId: selectedCandidate.jobCandidateId,
        postId: selectedCandidate.post.postId,
        companyAdminId: companyId,
        interviewDate: scheduleData.interviewDate,
        timeSlot: scheduleData.timeSlot,
        notes: scheduleData.notes
      };

      await axios.post('/api/executive-interview/schedule', scheduleData);
      
      alert('임원면접이 성공적으로 스케줄되었습니다.');
      setShowScheduleModal(false);
      setSelectedCandidate(null);
      setScheduleForm({
        interviewDate: '',
        timeSlot: '',
        notes: ''
      });
      
      // 목록 새로고침
      fetch4yCandidates();
      
    } catch (err) {
      console.error('면접 스케줄링 실패:', err);
      alert('면접 스케줄링에 실패했습니다.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setScheduleForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAnalysisInputChange = (e) => {
    const { name, value } = e.target;
    setAnalysisForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAnalyzeInterview = async (e) => {
    e.preventDefault();
    
    if (!analysisForm.s3Key || !analysisForm.jobDescription || !analysisForm.candidateProfile) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    try {
      setAnalysisLoading(true);
      
      const response = await axios.post('/api/executive-interview/analyze-interview-s3', {
        job_candidate_id: selectedCandidate?.jobCandidateId || 1,
        post_id: selectedCandidate?.post?.postId || 1,
        job_description: analysisForm.jobDescription,
        candidate_profile: analysisForm.candidateProfile,
        s3_key: analysisForm.s3Key
      });
      
      if (response.data.success) {
        alert('면접 분석이 완료되었습니다!');
        setShowAnalysisModal(false);
        setAnalysisForm({
          s3Key: '',
          jobDescription: '',
          candidateProfile: ''
        });
      } else {
        alert('면접 분석에 실패했습니다.');
      }
      
    } catch (err) {
      console.error('면접 분석 실패:', err);
      alert('면접 분석에 실패했습니다.');
    } finally {
      setAnalysisLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="executive-interview-management">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="executive-interview-management">
        <div className="error">{error}</div>
        <button onClick={fetch4yCandidates}>다시 시도</button>
      </div>
    );
  }

  return (
    <div className="executive-interview-management">
      <div className="header">
        <h1>임원면접 관리</h1>
        <p>AI 면접을 통과한 지원자들의 임원면접을 관리합니다.</p>
      </div>

      <div className="candidates-section">
        <h2>AI 면접 패스 지원자 목록 ({candidates.length}명)</h2>
        
        {candidates.length === 0 ? (
          <div className="no-candidates">
            <p>AI 면접을 통과한 지원자가 없습니다.</p>
          </div>
        ) : (
          <div className="candidates-grid">
            {candidates.map((candidate) => (
              <div key={candidate.jobCandidateId} className="candidate-card">
                <div className="candidate-info">
                  <h3>{candidate.candidate?.candidateName || '이름 없음'}</h3>
                  <p className="email">{candidate.candidate?.candidateEmail || '이메일 없음'}</p>
                  <p className="post-title">{candidate.post?.postTitle || '공고 제목 없음'}</p>
                  <p className="stage">현재 단계: {candidate.jobCandCurrStage}</p>
                </div>
                
                <div className="candidate-actions">
                  <button 
                    className="schedule-btn"
                    onClick={() => handleScheduleInterview(candidate)}
                  >
                    임원면접 스케줄
                  </button>
                  
                  {/* 디버깅: 현재 상태 값 출력 */}
                  <div style={{fontSize: '12px', color: '#666', marginBottom: '8px'}}>
                    Debug: jobCandCurrStage = "{candidate.jobCandCurrStage}", 
                    type: {typeof candidate.jobCandCurrStage}<br/>
                    Full candidate object: {JSON.stringify(candidate, null, 2)}
                  </div>
                  
                  {/* job_cand_curr_stage를 기준으로 버튼 표시 */}
                  {candidate.jobCandCurrStage === '5y' ? (
                    <button 
                      className="analyze-btn"
                      onClick={() => {
                        // schedule_id를 직접 사용 (candidate 데이터에서)
                        setSelectedScheduleId(candidate.scheduleId || candidate.id);
                        setShowAnalysisResult(true);
                      }}
                    >
                      면접 분석
                    </button>
                  ) : (
                    <button 
                      className="start-interview-btn"
                      onClick={() => {
                        setSelectedCandidate(candidate);
                        setShowInterviewSession(true);
                      }}
                    >
                      면접 보러가기
                    </button>
                  )}
                  
                  <button className="view-profile-btn">
                    프로필 보기
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 임원면접 스케줄링 모달 */}
      {showScheduleModal && selectedCandidate && (
        <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>임원면접 스케줄링</h3>
              <button 
                className="close-btn"
                onClick={() => setShowScheduleModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="candidate-summary">
                <h4>지원자 정보</h4>
                <p><strong>이름:</strong> {selectedCandidate.candidate?.candidateName}</p>
                <p><strong>이메일:</strong> {selectedCandidate.candidate?.candidateEmail}</p>
                <p><strong>공고:</strong> {selectedCandidate.post?.postTitle}</p>
              </div>
              
              <form onSubmit={handleScheduleSubmit}>
                <div className="form-group">
                  <label htmlFor="interviewDate">면접 날짜 *</label>
                  <input
                    type="date"
                    id="interviewDate"
                    name="interviewDate"
                    value={scheduleForm.interviewDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="timeSlot">면접 시간 *</label>
                  <select
                    id="timeSlot"
                    name="timeSlot"
                    value={scheduleForm.timeSlot}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">시간 선택</option>
                    <option value="09:00-10:00">09:00-10:00</option>
                    <option value="10:00-11:00">10:00-11:00</option>
                    <option value="11:00-12:00">11:00-12:00</option>
                    <option value="13:00-14:00">13:00-14:00</option>
                    <option value="14:00-15:00">14:00-15:00</option>
                    <option value="15:00-16:00">15:00-16:00</option>
                    <option value="16:00-17:00">16:00-17:00</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="notes">메모</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={scheduleForm.notes}
                    onChange={handleInputChange}
                    placeholder="면접 관련 특이사항이나 준비사항을 입력하세요."
                    rows="3"
                  />
                </div>
                
                <div className="form-actions">
                  <button type="button" onClick={() => setShowScheduleModal(false)}>
                    취소
                  </button>
                  <button type="submit" className="submit-btn">
                    스케줄 생성
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 면접 분석 모달 */}
      {showAnalysisModal && selectedCandidate && (
        <div className="modal-overlay" onClick={() => setShowAnalysisModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>면접 음성 분석</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAnalysisModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="candidate-summary">
                <h4>지원자 정보</h4>
                <p><strong>이름:</strong> {selectedCandidate.candidate?.candidateName}</p>
                <p><strong>이메일:</strong> {selectedCandidate.candidate?.candidateEmail}</p>
                <p><strong>공고:</strong> {selectedCandidate.post?.postTitle}</p>
              </div>
              
              <form onSubmit={handleAnalyzeInterview}>
                <div className="form-group">
                  <label htmlFor="s3Key">S3 음성 파일 키 *</label>
                  <input
                    type="text"
                    id="s3Key"
                    name="s3Key"
                    value={analysisForm.s3Key}
                    onChange={handleAnalysisInputChange}
                    placeholder="예: interviews/candidate_123_interview.mp3"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="jobDescription">채용 공고 내용 *</label>
                  <textarea
                    id="jobDescription"
                    name="jobDescription"
                    value={analysisForm.jobDescription}
                    onChange={handleAnalysisInputChange}
                    placeholder="채용 공고의 상세 내용을 입력하세요."
                    rows="3"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="candidateProfile">지원자 프로필 *</label>
                  <textarea
                    id="candidateProfile"
                    name="candidateProfile"
                    value={analysisForm.candidateProfile}
                    onChange={handleAnalysisInputChange}
                    placeholder="지원자의 경력, 기술 스택 등을 입력하세요."
                    rows="3"
                    required
                  />
                </div>
                
                <div className="form-actions">
                  <button type="button" onClick={() => setShowAnalysisModal(false)}>
                    취소
                  </button>
                  <button type="submit" className="submit-btn" disabled={analysisLoading}>
                    {analysisLoading ? '분석 중...' : '분석 시작'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 면접 분석 결과 모달 */}
      {showAnalysisResult && selectedScheduleId && (
        <InterviewAnalysisResult
          scheduleId={selectedScheduleId}
          onClose={() => {
            setShowAnalysisResult(false);
            setSelectedScheduleId(null);
          }}
        />
      )}

      {/* 실시간 임원면접 세션 */}
      {showInterviewSession && selectedCandidate && (
        <ExecutiveInterviewSession
          candidate={selectedCandidate}
          onInterviewComplete={(result) => {
            console.log('면접 완료:', result);
            // 여기서 S3 키를 받아서 자동으로 분석 시작할 수 있습니다
            setShowInterviewSession(false);
          }}
          onClose={() => setShowInterviewSession(false)}
        />
      )}
    </div>
  );
};

export default ExecutiveInterviewManagement; 
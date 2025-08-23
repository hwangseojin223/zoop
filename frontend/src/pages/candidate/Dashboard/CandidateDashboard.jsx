import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import SEO from '../../../components/SEO';

import { Sidebar } from '../Sidebar';
import { PortfolioNavbar } from '../Portfolio';
import { 
  JobSelectionModal,
  RegionSelectionModal,
  SalarySelectionModal,
  CompanySizeSelectionModal,
  CommuteTimeSelectionModal,
  BenefitSelectionModal
} from '../Modals';
import { InterviewSchedulerModal } from '../Interview';
import InterviewPreparationModal from '../../../components/InterviewPreparationModal';

import './CandidateDashboard.css';

// 임원면접 정보 컴포넌트
const ExecutiveInterviewInfo = ({ post }) => {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadSchedule = async () => {
      if (post.jobCandCurrStage === '5n') {
        setLoading(true);
        try {
          // postId와 candidateId로 jobCandidateId 조회
          const candidateId = localStorage.getItem('userId') || 19;
          const response = await fetch(`http://localhost:8081/api/progress/find-job-candidate-id?postId=${post.postId}&candidateId=${candidateId}`);
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.jobCandidateId) {
              // jobCandidateId로 임원면접 일정 조회
              const scheduleResponse = await fetch(`http://localhost:8081/api/executive-interview/schedule/${data.jobCandidateId}`);
              if (scheduleResponse.ok) {
                const scheduleData = await scheduleResponse.json();
                if (scheduleData && scheduleData.length > 0) {
                  setSchedule(scheduleData[0]);
                  return;
                }
              }
            }
          }
          
          console.log('임원면접 일정을 찾을 수 없습니다.');
        } catch (error) {
          console.error(`공고 ${post.postId}의 임원면접 일정 조회 실패:`, error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadSchedule();
  }, [post]);
  
  if (loading) {
    return (
      <div style={{ marginTop: '0.5rem', textAlign: 'center', color: '#666', fontSize: '0.8rem' }}>
        면접 일정 불러오는 중...
      </div>
    );
  }
  
  if (!schedule) {
    return (
      <div style={{ marginTop: '0.5rem', textAlign: 'center', color: '#666', fontSize: '0.8rem' }}>
        임원면접 일정이 아직 정해지지 않았습니다.
      </div>
    );
  }
  
  return (
    <div style={{ marginTop: '0.5rem' }}>
      {/* 임원면접 일정 정보 */}
      <div style={{
        padding: '0.4rem',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        borderRadius: '6px',
        border: '1px solid #0ea5e9',
        marginBottom: '0.5rem',
        fontSize: '0.75rem',
        color: '#0c4a6e'
      }}>
        <div style={{ marginBottom: '0.2rem' }}>
          <strong>📅 면접 일시:</strong> {schedule.interviewDate ? 
            new Date(schedule.interviewDate).toLocaleDateString('ko-KR', { 
              month: 'short', 
              day: 'numeric',
              weekday: 'short'
            }) : '일정 없음'
          }
        </div>
        <div>
          <strong>⏰ 면접 시간:</strong> {schedule.timeSlot || '시간 없음'}
        </div>
      </div>
      
      {/* 면접 참여하기 버튼 */}
      <button
        onClick={() => {
          // postId와 candidateId로 jobCandidateId 조회
          const getJobCandidateId = async () => {
            try {
              const candidateId = localStorage.getItem('userId') || 19;
              const response = await fetch(`http://localhost:8081/api/progress/find-job-candidate-id?postId=${post.postId}&candidateId=${candidateId}`);
              
              if (response.ok) {
                const data = await response.json();
                if (data.success && data.jobCandidateId) {
                  navigate(`/executive-interview-session/${data.jobCandidateId}`);
                } else {
                  alert('면접 정보를 찾을 수 없습니다. 관리자에게 문의해주세요.');
                }
              } else {
                alert('면접 정보 조회에 실패했습니다.');
              }
            } catch (error) {
              console.error('jobCandidateId 조회 실패:', error);
              alert('면접 참여 중 오류가 발생했습니다.');
            }
          };
          
          getJobCandidateId();
        }}
        style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          padding: '0.4rem 0.8rem',
          fontWeight: '500',
          fontSize: '0.8rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 4px rgba(139, 92, 246, 0.2)',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.2rem'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 3px 8px rgba(139, 92, 246, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(139, 92, 246, 0.2)';
        }}
      >
        📹 면접 참여하기
      </button>
    </div>
  );
};

// DB 날짜 포맷을 Date 객체로 변환하는 함수
function parseDbDate(str) {
  if (!str || typeof str !== 'string') return null;
  // ISO 포맷(yyyy-MM-ddTHH:mm:ss)도 지원
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(str)) {
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }
  // 기존 yy/MM/dd HH:mm:ss.SSS... 포맷
  const [date, time] = str.split(' ');
  if (!date || !time) return null;
  const [yy, MM, dd] = date.split('/');
  if (!yy || !MM || !dd) return null;
  const yyyy = Number(yy) < 50 ? '20' + yy : '19' + yy;
  const timePart = time.split('.')[0];
  const isoString = `${yyyy}-${MM}-${dd}T${timePart}`;
  const d = new Date(isoString);
  return isNaN(d.getTime()) ? null : d;
}

// Date 객체를 KST(로컬)로 변환해서 표시하는 함수
function formatUtcToKst(dateObj) {
  if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) return '';
  return dateObj.toLocaleString('ko-KR', { hour12: false });
}

// 남은 시간을 계산하는 함수 (실제 남은 시간 계산)
const calculateRemainingTime = (deadlineDate) => {
  if (!deadlineDate || !(deadlineDate instanceof Date) || isNaN(deadlineDate.getTime())) return '';
  
  const now = new Date();
  const diffMs = deadlineDate - now;
  
  if (diffMs <= 0) return '면접이 종료되었습니다.';
  
  const diffMin = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMin / 60);
  const minutes = diffMin % 60;
  
  if (diffMin < 1) {
    return '곧 종료됩니다!';
  } else if (hours > 0) {
    return `면접 종료까지 ${hours}시간 ${minutes}분 남았습니다.`;
  } else {
    return `면접 종료까지 ${minutes}분 남았습니다.`;
  }
};

// 스테이지별 색상 스타일 함수
const getStageColor = (code) => {
  switch (code) {
    case '0': return { bg: '#e2e8f0', text: '#4a5568', border: '#cbd5e0' }; // 지원
    case '0n': return { bg: '#fed7d7', text: '#e53e3e', border: '#fc8181' }; // 지원 거절
    case '1n': return { bg: '#fef5e7', text: '#d69e2e', border: '#f6ad55' }; // GitHub 필터링
    case '2n': return { bg: '#e6fffa', text: '#319795', border: '#b2f5ea' }; // 이메일 발송
    case '2y': return { bg: '#f0fff4', text: '#38a169', border: '#9ae6b4' }; // 포트폴리오 제출
            case '2p': return { bg: 'transparent', text: 'transparent', border: 'transparent' }; // 포트폴리오 통과 배지 제거
            case '3n': return { bg: 'transparent', text: 'transparent', border: 'transparent' }; // AI 면접 예정 배지 제거
    case '3y': return { bg: '#f0fff4', text: '#38a169', border: '#9ae6b4' }; // AI 면접 완료
    case '4n': return { bg: '#fed7d7', text: '#e53e3e', border: '#fc8181' }; // AI 면접 불합격
    case '4y': return { bg: '#c6f6d5', text: '#38a169', border: '#68d391' }; // AI 면접 합격
    case '5n': return { bg: 'transparent', text: 'transparent', border: 'transparent' }; // 임원면접 예정 배지 제거
    case '5y': return { bg: '#f0fff4', text: '#38a169', border: '#9ae6b4' }; // 임원면접 완료
    case '6n': return { bg: '#fed7d7', text: '#e53e3e', border: '#fc8181' }; // 최종 불합격
    case '6y': return { bg: '#c6f6d5', text: '#38a169', border: '#68d391' }; // 최종 합격
    default: return { bg: '#e2e8f0', text: '#4a5568', border: '#cbd5e0' };
  }
};

// 스테이지별 라벨 함수
const getStageLabel = (code) => {
  switch (code) {
    case '0': return '지원';
    case '0n': return '지원 거절';
    case '1n': return 'GitHub 필터링';
    case '2n': return '포트폴리오 대기';
    case '2y': return '포트폴리오 제출';
            case '2p': return ''; // 포트폴리오 통과 배지 제거
            case '3n': return ''; // AI 면접 예정 배지 제거
    case '3y': return 'AI 면접 완료';
    case '4n': return 'AI 면접 불합격';
    case '4y': return 'AI 면접 합격';
    case '5n': return ''; // 임원면접 예정 배지 제거
    case '5y': return '임원면접 완료';
    case '6n': return '최종 불합격';
    case '6y': return '최종 합격';
    default: return '진행중';
  }
};

function CandidateDashboard() {
  const { authState } = useAuth();
  const navigate = useNavigate();

  const [userName, setUserName] = useState('게스트');
  const [activeTab, setActiveTab] = useState('all');
  const [jobPostings, setJobPostings] = useState([]);
  const [scheduledInterviews, setScheduledInterviews] = useState({});
  const [executiveInterviewSchedules, setExecutiveInterviewSchedules] = useState([]);
  const [aiInterviewSchedules, setAiInterviewSchedules] = useState([]);
  const [executiveInterviewLoading, setExecutiveInterviewLoading] = useState(false);
  const [aiInterviewLoading, setAiInterviewLoading] = useState(false);

  // 모달 상태
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [isCompanySizeModalOpen, setIsCompanySizeModalOpen] = useState(false);
  const [isCommuteTimeModalOpen, setIsCommuteTimeModalOpen] = useState(false);
  const [isBenefitModalOpen, setIsBenefitModalOpen] = useState(false);
  const [isInterviewSchedulerModalOpen, setIsInterviewSchedulerModalOpen] = useState(false);
  const [isInterviewPreparationModalOpen, setIsInterviewPreparationModalOpen] = useState(false);

  // 선택된 값들
  const [selectedJob, setSelectedJob] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedSalary, setSelectedSalary] = useState('');
  const [selectedCompanySize, setSelectedCompanySize] = useState('');
  const [selectedCommuteTime, setSelectedCommuteTime] = useState('');
  const [selectedBenefits, setSelectedBenefits] = useState([]);
  const [selectedPostIdForScheduling, setSelectedPostIdForScheduling] = useState(null);
  const [selectedPostIdForPreparation, setSelectedPostIdForPreparation] = useState(null);

  // candidateId 가져오기
  const candidateId = authState?.userId || localStorage.getItem('userId');
  
  // 디버깅용 로그
  console.log('현재 candidateId:', candidateId);
  console.log('authState:', authState);
  
  // githubLogin 기반으로 candidateId 조회 (fallback)
  const [actualCandidateId, setActualCandidateId] = useState(candidateId);

  // 공고 목록 가져오기
  const fetchJobPostings = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/candidates/${actualCandidateId || candidateId}/job-postings`);
      if (response.ok) {
        const data = await response.json();
        setJobPostings(data);
      }
    } catch (error) {
      console.error('공고 목록 가져오기 오류:', error);
    }
  };

  // 기존 면접 일정 정보 불러오기
  const loadExistingInterviewSchedules = async () => {
    try {
      const jobPostingsResponse = await fetch(`http://localhost:8081/api/candidates/${actualCandidateId || candidateId}/job-postings`);
      if (jobPostingsResponse.ok) {
        const jobPostings = await jobPostingsResponse.json();
        
        // 3n 단계인 공고들에 대해 면접 일정 조회
        const aiInterviewPosts = jobPostings.filter(post => post.jobCandCurrStage === '3n');
        
        if (aiInterviewPosts.length > 0) {
          // 각 3n 단계 공고에 대해 면접 일정 조회
          const interviewPromises = aiInterviewPosts.map(async (post) => {
            try {
              // postId와 candidateId로 면접 일정 조회 (백엔드에 이미 존재하는 API 사용)
              const candidateId = actualCandidateId || localStorage.getItem('userId') || 19;
              const response = await fetch(`http://localhost:8081/api/interview-schedules/by-post-candidate?postId=${post.postId}&candidateId=${candidateId}`);
              
              if (response.ok) {
                const scheduleData = await response.json();
                if (scheduleData && scheduleData.scheduleId) {
                  // 면접 일정이 있으면 scheduledInterviews에 추가
                  return {
                    postId: post.postId,
                    date: scheduleData.scheduledTime ? new Date(scheduleData.scheduledTime).toLocaleString('ko-KR') : '일정 없음',
                    time: scheduleData.scheduledTime ? new Date(scheduleData.scheduledTime).toLocaleTimeString('ko-KR') : '',
                    iso: scheduleData.scheduledTime ? new Date(scheduleData.scheduledTime) : null,
                    deadline: scheduleData.deadlineTime ? new Date(scheduleData.deadlineTime) : null,
                    link: scheduleData.interviewLink || '',
                    scheduleId: scheduleData.scheduleId
                  };
                }
              }
            } catch (error) {
              console.error(`공고 ${post.postId}의 면접 일정 조회 실패:`, error);
            }
            return null;
          });
          
          const interviewResults = await Promise.all(interviewPromises);
          const validInterviews = interviewResults.filter(result => result !== null);
          
          // scheduledInterviews 상태 업데이트
          const newScheduledInterviews = {};
          validInterviews.forEach(interview => {
            newScheduledInterviews[interview.postId] = interview;
          });
          
          setScheduledInterviews(prev => ({
            ...prev,
            ...newScheduledInterviews
          }));
        }
      }
    } catch (error) {
      console.error('기존 면접 일정 정보 불러오기 오류:', error);
    }
  };

  // 임원면접 일정 정보 불러오기
  const loadExecutiveInterviewSchedules = async () => {
    try {
      setExecutiveInterviewLoading(true);
      
      console.log('임원면접 일정 불러오기 시작, candidateId:', candidateId);
      
      const jobPostingsResponse = await fetch(`http://localhost:8081/api/candidates/${actualCandidateId || candidateId}/job-postings`);
      if (jobPostingsResponse.ok) {
        const jobPostings = await jobPostingsResponse.json();
        
        console.log('가져온 jobPostings:', jobPostings);
        
        const executiveInterviewPosts = jobPostings.filter(post => post.jobCandCurrStage === '5n');
        
        console.log('임원면접 단계 공고들:', executiveInterviewPosts);
        
        if (executiveInterviewPosts.length > 0) {
          const schedulePromises = executiveInterviewPosts.map(async (post) => {
            try {
              // jobCandidateId가 없으면 githubLogin으로 조회
              let jobCandidateId = post.jobCandidateId;
              if (!jobCandidateId) {
                const progressResponse = await fetch(`http://localhost:8081/api/progress/job-cand-progress/by-github-login/${authState?.loginId || localStorage.getItem('loginId')}`);
                if (progressResponse.ok) {
                  const progressData = await progressResponse.json();
                  if (progressData && progressData.post && progressData.post.postId === post.postId) {
                    jobCandidateId = progressData.jobCandidateId;
                  }
                }
              }
              
              if (jobCandidateId) {
                const scheduleResponse = await fetch(`http://localhost:8081/api/executive-interview/schedule/${jobCandidateId}`);
                if (scheduleResponse.ok) {
                  const scheduleData = await scheduleResponse.json();
                  return {
                    ...post,
                    executiveInterviewSchedule: scheduleData,
                    jobCandidateId: jobCandidateId
                  };
                }
              }
            } catch (error) {
              console.error(`공고 ${post.postId}의 임원면접 일정 조회 실패:`, error);
            }
            return post;
          });
          
          const postsWithSchedules = await Promise.all(schedulePromises);
          setExecutiveInterviewSchedules(postsWithSchedules);
        } else {
          setExecutiveInterviewSchedules([]);
        }
      }
    } catch (error) {
      console.error('임원면접 일정 정보 불러오기 오류:', error);
      setExecutiveInterviewSchedules([]);
    } finally {
      setExecutiveInterviewLoading(false);
    }
  };

  // AI 면접 일정 정보 불러오기
  const loadAiInterviewSchedules = async () => {
    try {
      setAiInterviewLoading(true);
      
      const jobPostingsResponse = await fetch(`http://localhost:8081/api/candidates/${actualCandidateId || candidateId}/job-postings`);
      if (jobPostingsResponse.ok) {
        const jobPostings = await jobPostingsResponse.json();
        
        const aiInterviewPosts = jobPostings.filter(post => post.jobCandCurrStage === '3n');
        
        if (aiInterviewPosts.length > 0) {
          // API 호출 없이 3n 단계 공고들만 설정
          setAiInterviewSchedules(aiInterviewPosts);
        } else {
          setAiInterviewSchedules([]);
        }
      }
    } catch (error) {
      console.error('AI 면접 일정 정보 불러오기 오류:', error);
      setAiInterviewSchedules([]);
    } finally {
      setAiInterviewLoading(false);
    }
  };

  // 사용자 설정 불러오기
  const loadPreferencesFromDB = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/candidates/${actualCandidateId || candidateId}/preferences`);
      if (response.ok) {
        const preferences = await response.json();
        setSelectedJob(preferences.preferredJob || '');
        setSelectedRegion(preferences.preferredRegion || '');
        setSelectedSalary(preferences.preferredSalary || '');
        setSelectedCompanySize(preferences.preferredCompanySize || '');
        setSelectedCommuteTime(preferences.preferredCommuteTime || '');
        setSelectedBenefits(preferences.preferredBenefits ? JSON.parse(preferences.preferredBenefits) : []);
      }
    } catch (error) {
      console.error('사용자 설정 불러오기 오류:', error);
    }
  };

  // 사용자 설정 저장
  const savePreferencesToDB = async (preferences) => {
    try {
              const response = await fetch(`http://localhost:8081/api/candidates/${actualCandidateId || candidateId}/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences)
      });
      if (!response.ok) {
        console.error('설정 저장 실패:', response.status);
      }
    } catch (error) {
      console.error('설정 저장 오류:', error);
    }
  };

  // useEffect - 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    const fetchUserDataAndJobPostings = async () => {
      try {
        // 1. 사용자 정보 가져오기
        const userResponse = await fetch(`http://localhost:8081/api/candidates/${actualCandidateId || candidateId}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserName(userData.candidateName || '사용자');
        }

        // 2. 공고 목록 가져오기
        const postingsResponse = await fetch(`http://localhost:8081/api/candidates/${actualCandidateId || candidateId}/job-postings`);
        if (postingsResponse.ok) {
          const postingsData = await postingsResponse.json();
          
          // 임원면접 단계인 공고들에 대해 임원면접 일정 정보 추가
          const postingsWithSchedules = await Promise.all(
            postingsData.map(async (post) => {
              if (post.jobCandCurrStage === '5n') {
                try {
                  // jobCandidateId가 필요하므로 job_cand_progress에서 조회
                  const progressResponse = await fetch(`http://localhost:8081/api/progress/job-cand-progress/by-github-login/${authState?.loginId || localStorage.getItem('loginId')}`);
                  if (progressResponse.ok) {
                    const progressData = await progressResponse.json();
                    if (progressData && progressData.post && progressData.post.postId === post.postId) {
                      const scheduleResponse = await fetch(`http://localhost:8081/api/executive-interview/schedule/${progressData.jobCandidateId}`);
                      if (scheduleResponse.ok) {
                        const scheduleData = await scheduleResponse.json();
                        return {
                          ...post,
                          executiveInterviewSchedule: scheduleData,
                          jobCandidateId: progressData.jobCandidateId
                        };
                      }
                    }
                  }
                } catch (error) {
                  console.error(`공고 ${post.postId}의 임원면접 일정 조회 실패:`, error);
                }
              }
              return post;
            })
          );
          
          setJobPostings(postingsWithSchedules);
          
          // 공고가 없으면 githubLogin으로 실제 candidateId 조회 시도
          if (postingsData.length === 0) {
            const githubLogin = authState?.loginId || localStorage.getItem('loginId');
            if (githubLogin) {
              console.log('공고가 없어서 githubLogin으로 조회 시도:', githubLogin);
              const progressResponse = await fetch(`http://localhost:8081/api/progress/job-cand-progress/by-github-login/${githubLogin}`);
              if (progressResponse.ok) {
                const progressData = await progressResponse.json();
                if (progressData && progressData.candidate && progressData.candidate.candidateId) {
                  const actualId = progressData.candidate.candidateId;
                  setActualCandidateId(actualId);
                  console.log('githubLogin으로 조회한 실제 candidateId:', actualId);
                  
                  // 실제 candidateId로 다시 시도
                  const retryResponse = await fetch(`http://localhost:8081/api/candidates/${actualId}/job-postings`);
                  if (retryResponse.ok) {
                    const retryData = await retryResponse.json();
                    setJobPostings(retryData);
                    console.log('실제 candidateId로 조회한 공고:', retryData);
                  }
                }
              }
            }
          }
        }

        // 3. 사용자 설정 불러오기
        await loadPreferencesFromDB();
        
        // 4. 기존 면접 일정 정보 불러오기
        await loadExistingInterviewSchedules();
        
        // 5. 임원면접 일정 정보 불러오기
        await loadExecutiveInterviewSchedules();
        
        // 6. AI 면접 일정 정보 불러오기
        await loadAiInterviewSchedules();
        
      } catch (error) {
        console.error('데이터 가져오기 오류:', error);
        setUserName('오류 발생');
        setJobPostings([]);
      }
    };

    if (candidateId) {
      fetchUserDataAndJobPostings();
    }
  }, [candidateId, authState?.loginId]);

  // 면접 일정 변경 시 자동으로 데이터 다시 로드
  useEffect(() => {
    if (Object.keys(scheduledInterviews).length > 0) {
      // scheduledInterviews가 변경되면 면접 일정 정보 다시 로드
      loadExistingInterviewSchedules();
    }
  }, [scheduledInterviews]);

  // 탭 클릭 핸들러
  const handleTabClick = async (tabId) => {
    setActiveTab(tabId);
    
    // "전체" 탭으로 이동할 때 임원면접 일정 정보 로드
    if (tabId === 'all') {
      try {
        const postsWithSchedules = await getJobPostingsWithSchedules();
        setJobPostings(postsWithSchedules);
      } catch (error) {
        console.error('전체 탭 임원면접 일정 로드 실패:', error);
      }
    }
  };

  // 모달 관련 함수들
  const openInterviewSchedulerModal = (postId) => {
    setSelectedPostIdForScheduling(postId);
    setIsInterviewSchedulerModalOpen(true);
  };

  const closeInterviewSchedulerModal = () => {
    setIsInterviewSchedulerModalOpen(false);
    setSelectedPostIdForScheduling(null);
  };

  const openInterviewPreparationModal = (postId) => {
    setSelectedPostIdForPreparation(postId);
    setIsInterviewPreparationModalOpen(true);
  };

  const closeInterviewPreparationModal = () => {
    setIsInterviewPreparationModalOpen(false);
    setSelectedPostIdForPreparation(null);
  };

  // 면접 일정 처리
  const handleInterviewScheduled = async (postId, scheduleInfo) => {
    console.log("면접 일정 저장됨:", postId, scheduleInfo);
    
    try {
      // 모달에서 전달받은 데이터를 직접 사용
      const scheduledDate = parseDbDate(scheduleInfo.scheduledTime);
      const deadlineDate = parseDbDate(scheduleInfo.deadlineTime);
      
      // 해당 공고의 단계를 3n으로 변경 (면접 일정 정함)
      setJobPostings(prev => prev.map(post => 
        post.postId === postId 
          ? { ...post, jobCandCurrStage: '3n' }
          : post
      ));
      
      // 면접 일정을 API에서 다시 조회하여 scheduledInterviews 상태 업데이트
      try {
        const candidateId = actualCandidateId || localStorage.getItem('userId') || 19;
        // postId와 candidateId로 면접 일정 조회 (백엔드에 이미 존재하는 API 사용)
        const response = await fetch(`http://localhost:8081/api/interview-schedules/by-post-candidate?postId=${postId}&candidateId=${candidateId}`);
        
        if (response.ok) {
          const scheduleData = await response.json();
          if (scheduleData && scheduleData.scheduleId) {
            // scheduledInterviews 상태 업데이트
            setScheduledInterviews(prev => ({
              ...prev,
              [postId]: {
                postId: postId,
                date: scheduleData.scheduledTime ? new Date(scheduleData.scheduledTime).toLocaleString('ko-KR') : '일정 없음',
                time: scheduleData.scheduledTime ? new Date(scheduleData.scheduledTime).toLocaleTimeString('ko-KR') : '',
                iso: scheduleData.scheduledTime ? new Date(scheduleData.scheduledTime) : null,
                deadline: scheduleData.deadlineTime ? new Date(scheduleData.deadlineTime) : null,
                link: scheduleData.interviewLink || '',
                scheduleId: scheduleData.scheduleId
              }
            }));
            
            console.log(`면접 일정 업데이트 완료 - postId: ${postId}, scheduledInterviews:`, {
              ...scheduledInterviews,
              [postId]: {
                postId: postId,
                date: scheduleData.scheduledTime ? new Date(scheduleData.scheduledTime).toLocaleString('ko-KR') : '일정 없음',
                time: scheduleData.scheduledTime ? new Date(scheduleData.scheduledTime).toLocaleTimeString('ko-KR') : '',
                iso: scheduleData.scheduledTime ? new Date(scheduleData.scheduledTime) : null,
                deadline: scheduleData.deadlineTime ? new Date(scheduleData.deadlineTime) : null,
                link: scheduleData.interviewLink || '',
                scheduleId: scheduleData.scheduleId
              }
            });
          }
        }
      } catch (error) {
        console.error('면접 일정 조회 실패:', error);
        // API 조회 실패 시 모달 데이터로 fallback
        setScheduledInterviews(prev => ({
          ...prev,
          [postId]: {
            date: formatUtcToKst(scheduledDate),
            time: '',
            iso: scheduledDate,
            deadline: deadlineDate,
            link: scheduleInfo.interviewLink,
            scheduleId: scheduleInfo.scheduleId
          }
        }));
      }
      
    } catch (error) {
      console.error("면접 일정 등록 후 데이터 동기화 실패:", error);
    }
    
    closeInterviewSchedulerModal();
    
    // 면접 일정 업데이트 후 상태 확인
    setTimeout(() => {
      console.log('면접 일정 업데이트 후 상태 확인:');
      console.log('scheduledInterviews:', scheduledInterviews);
      console.log('jobPostings:', jobPostings);
    }, 1000);
  };



  // 면접 보러가기 버튼 클릭 시 호출되는 함수
  const handleGoToInterview = (postId) => {
    navigateToInterview(postId);
  };

  // 기타 핸들러 함수들
  const handleGoToSubmitPortfolio = (postId) => {
    navigate(`/submit-portfolio/${postId}`);
  };

  const handleGoToScheduleInterview = (postId) => {
      navigate(`/interview-scheduling/${postId}`);
  };

  const navigateToInterview = async (postId) => {
    try {
      // postId 유효성 검사
      if (!postId || isNaN(postId)) {
        console.error('잘못된 postId:', postId);
        alert('잘못된 공고 정보입니다.');
        return;
      }

      const interview = scheduledInterviews[postId];
      if (interview && interview.iso) {
        const interviewDateTime = new Date(interview.iso);
        const now = new Date();
        if (interviewDateTime > now) {
          alert('아직 면접 시작 시간이 되지 않았습니다.');
          return;
        }
      }

      // 올바른 API 엔드포인트 사용
      const response = await fetch(`http://localhost:8081/api/interview-schedules/by-post-candidate?postId=${postId}&candidateId=${candidateId}`);
      if (!response.ok) {
        throw new Error('면접 일정을 조회하는데 실패했습니다.');
      }
      
      const data = await response.json();
      if (data && data.scheduleId) {
        navigate(`/interview/${data.scheduleId}`);
      } else {
        alert('해당 공고에 대한 면접 일정을 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('면접 페이지로 이동 중 오류 발생:', error);
      alert(`면접 페이지로 이동할 수 없습니다: ${error.message}`);
    }
  };

  // 모달 관련 함수들
  const openJobModal = () => setIsJobModalOpen(true);
  const closeJobModal = () => setIsJobModalOpen(false);
  const handleJobSelected = async (job) => {
    setSelectedJob(job);
    localStorage.setItem('selectedJob', job);
    await savePreferencesToDB({ preferredJob: job });
  };

  const openRegionModal = () => setIsRegionModalOpen(true);
  const closeRegionModal = () => setIsRegionModalOpen(false);
  const handleRegionSelected = async (region) => {
    setSelectedRegion(region);
    localStorage.setItem('selectedRegion', region);
    await savePreferencesToDB({ preferredRegion: region });
  };

  const openSalaryModal = () => setIsSalaryModalOpen(true);
  const closeSalaryModal = () => setIsSalaryModalOpen(false);
  const handleSalarySelected = async (salary) => {
    setSelectedSalary(salary);
    localStorage.setItem('selectedSalary', salary);
    await savePreferencesToDB({ preferredSalary: salary });
  };

  const openCompanySizeModal = () => setIsCompanySizeModalOpen(true);
  const closeCompanySizeModal = () => setIsCompanySizeModalOpen(false);
  const handleCompanySizeSelected = async (size) => {
    setSelectedCompanySize(size);
    localStorage.setItem('selectedCompanySize', size);
    await savePreferencesToDB({ preferredCompanySize: size });
  };

  const openCommuteTimeModal = () => setIsCommuteTimeModalOpen(true);
  const closeCommuteTimeModal = () => setIsCommuteTimeModalOpen(false);
  const handleCommuteTimeSelected = async (time) => {
    setSelectedCommuteTime(time);
    localStorage.setItem('selectedCommuteTime', time);
    await savePreferencesToDB({ preferredCommuteTime: time });
  };

  const openBenefitModal = () => setIsBenefitModalOpen(true);
  const closeBenefitModal = () => setIsBenefitModalOpen(false);
  const handleBenefitsSelected = async (benefits) => {
    setSelectedBenefits(benefits);
    localStorage.setItem('selectedBenefits', JSON.stringify(benefits));
    await savePreferencesToDB({ preferredBenefits: JSON.stringify(benefits) });
  };

  const handleJobTitleClick = (postId) => {
    navigate(`/job/${postId}`);
  };

  // 공고 필터링
  const getFilteredJobPostings = () => {
    if (activeTab === 'all') {
      return jobPostings;
    } else if (activeTab === 'positionProposal') {
      return jobPostings.filter(post => ['0', '0n', '1n', '2n'].includes(post.jobCandCurrStage));
    } else if (activeTab === 'aiInterview') {
      return jobPostings.filter(post => ['2y', '2p', '3n', '3y', '4n', '4y'].includes(post.jobCandCurrStage));
    } else if (activeTab === 'executiveInterview') {
      return jobPostings.filter(post => ['5n', '5y'].includes(post.jobCandCurrStage));
    } else if (activeTab === 'resultAnnouncement') {
      return jobPostings.filter(post => ['6n', '6y'].includes(post.jobCandCurrStage));
    }
    return jobPostings;
  };
  
  // 임원면접 일정이 포함된 공고 목록 가져오기
  const getJobPostingsWithSchedules = async () => {
    if (activeTab === 'all') {
      // "전체" 탭에서는 임원면접 단계인 공고에 대해 일정 정보 추가
      const postsWithSchedules = await Promise.all(
        jobPostings.map(async (post) => {
          if (post.jobCandCurrStage === '5n' && !post.executiveInterviewSchedule) {
            try {
              // jobCandidateId가 없으면 githubLogin으로 조회
              let jobCandidateId = post.jobCandidateId;
              if (!jobCandidateId) {
                const progressResponse = await fetch(`http://localhost:8081/api/progress/job-cand-progress/by-github-login/${authState?.loginId || localStorage.getItem('loginId')}`);
                if (progressResponse.ok) {
                  const progressData = await progressResponse.json();
                  if (progressData && progressData.post && progressData.post.postId === post.postId) {
                    jobCandidateId = progressData.jobCandidateId;
                  }
                }
              }
              
              if (jobCandidateId) {
                const scheduleResponse = await fetch(`http://localhost:8081/api/executive-interview/schedule/${jobCandidateId}`);
                if (scheduleResponse.ok) {
                  const scheduleData = await scheduleResponse.json();
                  return {
                    ...post,
                    executiveInterviewSchedule: scheduleData,
                    jobCandidateId: jobCandidateId
                  };
                }
              }
            } catch (error) {
              console.error(`공고 ${post.postId}의 임원면접 일정 조회 실패:`, error);
            }
          }
          return post;
        })
      );
      return postsWithSchedules;
    }
    return jobPostings;
  };

  const filteredJobPostings = getFilteredJobPostings();

  return (
    <div className="candidate-dashboard">
      <SEO 
        title="개인회원 대시보드 | ZOOP"
        description="개인회원을 위한 맞춤형 채용 정보와 면접 일정을 확인하세요."
        keywords="개인회원, 대시보드, 채용정보, 면접일정, 포트폴리오"
      />
      
      <Sidebar />

      <div className="dashboard-main">
        <PortfolioNavbar />
        
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1>안녕하세요, {userName}님!</h1>
            <p>지원한 공고와 면접 일정을 한눈에 확인하세요.</p>
        </div>

          {/* 사용자 설정 섹션 */}
          <div className="user-preferences">
            <h2>나의 선호도 설정</h2>
            <div className="preferences-grid">
              <div className="preference-item" onClick={openJobModal}>
                <span className="preference-label">희망 직무</span>
                <span className="preference-value">{selectedJob || '선택해주세요'}</span>
              </div>
              <div className="preference-item" onClick={openRegionModal}>
                <span className="preference-label">희망 지역</span>
                <span className="preference-value">{selectedRegion || '선택해주세요'}</span>
              </div>
              <div className="preference-item" onClick={openSalaryModal}>
                <span className="preference-label">희망 연봉</span>
                <span className="preference-value">{selectedSalary || '선택해주세요'}</span>
              </div>
              <div className="preference-item" onClick={openCompanySizeModal}>
                <span className="preference-label">희망 회사 규모</span>
                <span className="preference-value">{selectedCompanySize || '선택해주세요'}</span>
              </div>
              <div className="preference-item" onClick={openCommuteTimeModal}>
                <span className="preference-label">희망 통근 시간</span>
                <span className="preference-value">{selectedCommuteTime || '선택해주세요'}</span>
              </div>
              <div className="preference-item" onClick={openBenefitModal}>
                <span className="preference-label">희망 복리후생</span>
                <span className="preference-value">
                  {selectedBenefits.length > 0 ? selectedBenefits.join(', ') : '선택해주세요'}
                </span>
            </div>
          </div>
        </div>

          {/* 탭 네비게이션 */}
          <div className="dashboard-tabs">
            <button
              className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => handleTabClick('all')}
            >
              전체
            </button>
            <button
              className={`tab-button ${activeTab === 'positionProposal' ? 'active' : ''}`}
              onClick={() => handleTabClick('positionProposal')}
            >
              포지션 제안
            </button>
            <button
              className={`tab-button ${activeTab === 'aiInterview' ? 'active' : ''}`}
              onClick={() => handleTabClick('aiInterview')}
            >
              AI 면접
            </button>
            <button 
              className={`tab-button ${activeTab === 'executiveInterview' ? 'active' : ''}`}
              onClick={() => handleTabClick('executiveInterview')}
            >
              임원면접
            </button>
            <button
              className={`tab-button ${activeTab === 'resultAnnouncement' ? 'active' : ''}`}
              onClick={() => handleTabClick('resultAnnouncement')}
            >
              최종 결과
            </button>
          </div>

          {/* 탭별 내용 */}
  {activeTab === 'all' && (
            <div className="tab-content">
              <h3>전체 공고 목록</h3>
              {filteredJobPostings.length > 0 ? (
                <ul className="job-postings-list">
                  {filteredJobPostings.map(post => (
            <li key={post.postId} className="job-posting-item">
              <div className="job-posting-flex-row">
                <div className="job-posting-content">
                  <div className="company-title-row">
                    <h3>{post.companyName}</h3>
                    <p 
                      onClick={() => handleJobTitleClick(post.postId)}
                      className="clickable-job-title"
                    >
                      {post.postTitle}
                    </p>
                  </div>
                  <div className="job-posting-dates">
                    <p>등록일: {post.postPostedDate}</p>
                    <p>마감일: {post.postExpiryDate}</p>
                  </div>
                </div>
                                        <div className="job-posting-action-col">
                          {/* 2n, 2p 단계가 아닐 때만 단계 배지 표시 */}
                          {post.jobCandCurrStage !== '2n' && post.jobCandCurrStage !== '2p' && (
                            <div 
                              className="stage-badge"
                              style={{
                                backgroundColor: getStageColor(post.jobCandCurrStage).bg,
                                color: getStageColor(post.jobCandCurrStage).text,
                                border: `1px solid ${getStageColor(post.jobCandCurrStage).border}`
                              }}
                            >
                              {getStageLabel(post.jobCandCurrStage)}
                            </div>
                          )}
                          
                          {/* 2n 단계일 때 포트폴리오 제출 버튼 표시 */}
                          {post.jobCandCurrStage === '2n' && (
                            <button
                              className="submit-portfolio-button"
                              onClick={() => handleGoToSubmitPortfolio(post.postId)}
                              style={{ marginTop: '0.8rem', width: '100%' }}
                            >
                              📁 포트폴리오 제출
                            </button>
                          )}
                          
                          {/* 2p 단계일 때 면접 일정 정하기 버튼 표시 */}
                          {post.jobCandCurrStage === '2p' && (
                            <button
                              className="interview-scheduler-button"
                              onClick={() => openInterviewSchedulerModal(post.postId)}
                              style={{ marginTop: '0.8rem', width: '100%' }}
                            >
                              📅 면접 일정 정하기
                            </button>
                          )}
                          
                          {/* 임원면접 예정인 경우 날짜/시간과 면접 참여 버튼 표시 */}
                          {post.jobCandCurrStage === '5n' && (
                            <ExecutiveInterviewInfo post={post} />
                          )}
                          
                          {/* AI 면접 예정인 경우 면접 정보 표시 */}
                          {post.jobCandCurrStage === '3n' && (
                            <div className="interview-info">
                              {scheduledInterviews[post.postId] ? (
                                <>
                                  <p style={{ fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>
                                    면접 일정: {scheduledInterviews[post.postId].date}
                                  </p>
                                  <button 
                                    className="interview-go-btn"
                                    onClick={() => handleGoToInterview(post.postId)}
                                    style={{
                                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '0.4rem 0.8rem',
                                      fontWeight: '500',
                                      fontSize: '0.8rem',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease',
                                      width: '100%'
                                    }}
                                  >
                                    🎯 면접 보러가기
                                  </button>
                                  <div style={{
                                    marginTop: '0.4rem',
                                    padding: '0.4rem',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    borderRadius: '6px',
                                    fontSize: '0.7rem',
                                    color: '#1d4ed8',
                                    textAlign: 'center'
                                  }}>
                                    {calculateRemainingTime(scheduledInterviews[post.postId].iso)}
                                  </div>
                                </>
                              ) : (
                                <button
                                  className="interview-scheduler-button"
                                  onClick={() => openInterviewSchedulerModal(post.postId)}
                                  style={{
                                    background: 'transparent',
                                    color: '#10b981',
                                    border: '2px solid #10b981',
                                    borderRadius: '6px',
                                    padding: '0.4rem 0.8rem',
                                    fontWeight: '500',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    width: '100%'
                                  }}
                                >
                                  📅 면접 일정 정하기
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>표시할 공고가 없습니다.</p>
              )}
            </div>
          )}

          {activeTab === 'positionProposal' && (
            <div className="tab-content">
              <h3>포지션 제안 단계</h3>
              {filteredJobPostings.length > 0 ? (
                <ul className="job-postings-list">
                  {filteredJobPostings.map(post => (
                    <li key={post.postId} className="job-posting-item">
                      <div className="job-posting-flex-row">
                        <div className="job-posting-content">
                          <div className="company-title-row">
                            <h3>{post.companyName}</h3>
                            <p 
                              onClick={() => handleJobTitleClick(post.postId)}
                              className="clickable-job-title"
                            >
                              {post.postTitle}
                            </p>
                        </div>
                          <div className="job-posting-dates">
                            <p>등록일: {post.postPostedDate}</p>
                            <p>마감일: {post.postExpiryDate}</p>
                      </div>
                        </div>
                        <div className="job-posting-action-col">
                          {/* 2n, 2p 단계가 아닐 때만 단계 배지 표시 */}
                          {post.jobCandCurrStage !== '2n' && post.jobCandCurrStage !== '2p' && (
                            <div 
                              className="stage-badge"
                              style={{
                                backgroundColor: getStageColor(post.jobCandCurrStage).bg,
                                color: getStageColor(post.jobCandCurrStage).text,
                                border: `1px solid ${getStageColor(post.jobCandCurrStage).border}`
                              }}
                            >
                              {getStageLabel(post.jobCandCurrStage)}
                            </div>
                          )}
                          
                          {/* 2n 단계일 때 포트폴리오 제출 버튼 표시 */}
                          {post.jobCandCurrStage === '2n' && (
                            <button
                              className="submit-portfolio-button"
                              onClick={() => handleGoToSubmitPortfolio(post.postId)}
                              style={{ marginTop: '0.8rem', width: '100%' }}
                            >
                              📁 포트폴리오 제출
                            </button>
                          )}
                        </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
                <p>표시할 포지션 제안이 없습니다.</p>
      )}
    </div>
  )}

          {activeTab === 'aiInterview' && (
    <div className="tab-content">
              <h3>AI 면접 단계</h3>
              {filteredJobPostings.length > 0 ? (
                <ul className="job-postings-list">
                  {filteredJobPostings.map(post => (
            <li key={post.postId} className="job-posting-item">
              <div className="job-posting-flex-row">
                <div className="job-posting-content">
                  <div className="company-title-row">
                    <h3>{post.companyName}</h3>
                    <p 
                      onClick={() => handleJobTitleClick(post.postId)}
                      className="clickable-job-title"
                    >
                      {post.postTitle}
                    </p>
                  </div>
                  <div className="job-posting-dates">
                    <p>등록일: {post.postPostedDate}</p>
                    <p>마감일: {post.postExpiryDate}</p>
                  </div>
                </div>
                <div className="job-posting-action-col">
                          <div 
                            className="stage-badge"
                            style={{
                              backgroundColor: getStageColor(post.jobCandCurrStage).bg,
                              color: getStageColor(post.jobCandCurrStage).text,
                              border: `1px solid ${getStageColor(post.jobCandCurrStage).border}`
                            }}
                          >
                            {getStageLabel(post.jobCandCurrStage)}
                          </div>
                          
                          {/* 2p 단계일 때 면접 일정 정하기 버튼 표시 */}
                          {post.jobCandCurrStage === '2p' && (
                            <button
                              className="interview-scheduler-button"
                              onClick={() => openInterviewSchedulerModal(post.postId)}
                              style={{ marginTop: '0.8rem', width: '100%' }}
                            >
                              📅 면접 일정 정하기
                            </button>
                          )}
                          
                          {post.jobCandCurrStage === '3n' && (
                            <div className="interview-info">
                              {scheduledInterviews[post.postId] ? (
                                <>
                                  <p style={{ fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>
                                    면접 일정: {scheduledInterviews[post.postId].date}
                                  </p>
                                  <button 
                                    className="interview-go-btn"
                                    onClick={() => handleGoToInterview(post.postId)}
                                    style={{
                                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '0.4rem 0.8rem',
                                      fontWeight: '500',
                                      fontSize: '0.8rem',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease',
                                      width: '100%'
                                    }}
                                  >
                                    🎯 면접 보러가기
                                  </button>
                                  <div style={{
                                    marginTop: '0.4rem',
                                    padding: '0.4rem',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    borderRadius: '6px',
                                    fontSize: '0.7rem',
                                    color: '#1d4ed8',
                                    textAlign: 'center'
                                  }}>
                                    {calculateRemainingTime(scheduledInterviews[post.postId].iso)}
                                  </div>
                                </>
                              ) : (
                                <button
                                  className="interview-scheduler-button"
                                  onClick={() => openInterviewSchedulerModal(post.postId)}
                                  style={{
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '0.6rem 1rem',
                                    fontWeight: '500',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    width: '100%'
                                  }}
                                >
                                  📅 면접 일정 정하기
                                </button>
                              )}
                            </div>
                          )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    ) : (
                <p>표시할 AI 면접이 없습니다.</p>
    )}
  </div>
)}

          {activeTab === 'executiveInterview' && (
            <div className="tab-content">
              <h3>임원면접 단계</h3>
              {jobPostings.filter(post => post.jobCandCurrStage === '5n' || post.jobCandCurrStage === '5y').length > 0 ? (
                <ul className="job-postings-list">
                  {jobPostings
                    .filter(post => post.jobCandCurrStage === '5n' || post.jobCandCurrStage === '5y')
                    .map(post => (
                    <li key={post.postId} className="job-posting-item">
                      <div className="job-posting-flex-row">
                        <div className="job-posting-content">
                          <div className="company-title-row">
                            <h3>{post.companyName}</h3>
                            <p 
                              onClick={() => handleJobTitleClick(post.postId)}
                              className="clickable-job-title"
                            >
                              {post.postTitle}
                            </p>
                          </div>
                          <div className="job-posting-dates">
                            <p>등록일: {post.postPostedDate}</p>
                            <p>마감일: {post.postExpiryDate}</p>
                          </div>
                          
                          {/* 임원면접 일정 정보 */}
                          {post.executiveInterviewSchedule && (
                            <div className="executive-interview-schedule" style={{
                              marginTop: '0.5rem',
                              padding: '0.4rem',
                              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                              borderRadius: '6px',
                              border: '1px solid #0ea5e9',
                              boxShadow: '0 2px 4px rgba(14, 165, 233, 0.1)'
                            }}>
                              <h4 style={{
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                color: '#0369a1',
                                marginBottom: '0.4rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}>
                                📅 임원면접 일정
                              </h4>
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '0.5rem',
                                fontSize: '0.75rem',
                                color: '#0c4a6e'
                              }}>
                                <div>
                                  <strong>면접 일시:</strong><br />
                                  {new Date(post.executiveInterviewSchedule.interviewDate).toLocaleDateString('ko-KR', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric',
                                    weekday: 'short'
                                  })}
                                </div>
                                <div>
                                  <strong>면접 시간:</strong><br />
                                  {post.executiveInterviewSchedule.timeSlot}
                                </div>
                                <div>
                                  <strong>면접 상태:</strong><br />
                                  <span style={{
                                    background: '#10b981',
                                    color: 'white',
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '12px',
                                    fontSize: '0.7rem',
                                    fontWeight: '600'
                                  }}>
                                    예정
                                  </span>
                                </div>
                                {post.executiveInterviewSchedule.notes && (
                                  <div>
                                    <strong>메모:</strong><br />
                                    {post.executiveInterviewSchedule.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="job-posting-action-col">
                          <div 
                            className="stage-badge"
                            style={{
                              backgroundColor: getStageColor(post.jobCandCurrStage).bg,
                              color: getStageColor(post.jobCandCurrStage).text,
                              border: `1px solid ${getStageColor(post.jobCandCurrStage).border}`
                            }}
                          >
                            {getStageLabel(post.jobCandCurrStage)}
                          </div>
                          
                          {/* 면접 참여하기 버튼 */}
                          <div className="interview-actions" style={{ marginTop: '0.5rem' }}>
                            <button
                              onClick={() => {
                                // 임원면접 세션으로 이동
                                navigate(`/executive-interview-session/${post.jobCandidateId}`);
                              }}
                              style={{
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '0.4rem 0.8rem',
                                fontWeight: '500',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 4px rgba(139, 92, 246, 0.2)',
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.2rem'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 3px 8px rgba(139, 92, 246, 0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(139, 92, 246, 0.2)';
                              }}
                            >
                              📹 면접 참여하기
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{
                  padding: '2rem',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center',
                  color: '#4a5568'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📅</div>
                  <p>아직 임원면접 단계인 공고가 없습니다.</p>
                  <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#718096' }}>
                    AI 면접을 통과하면 임원면접 단계로 진행됩니다.
                  </p>
                </div>
              )}
            </div>
          )}

{activeTab === 'resultAnnouncement' && (
  <div className="tab-content">
              <h3>최종 채용 결과</h3>
              {filteredJobPostings.length > 0 ? (
                <ul className="job-postings-list">
                  {filteredJobPostings.map(post => (
        <li key={post.postId} className="job-posting-item">
          <div className="job-posting-flex-row">
            <div className="job-posting-content">
              <div className="company-title-row">
                <h3>{post.companyName}</h3>
                <p 
                  onClick={() => handleJobTitleClick(post.postId)}
                  className="clickable-job-title"
                >
                  {post.postTitle}
                </p>
              </div>
              <div className="job-posting-dates">
                <p>등록일: {post.postPostedDate}</p>
                <p>마감일: {post.postExpiryDate}</p>
              </div>
            </div>
            <div className="job-posting-action-col">
              <div 
                className="result-badge"
                style={{
                  backgroundColor: getStageColor(post.jobCandCurrStage).bg,
                  color: getStageColor(post.jobCandCurrStage).text,
                  border: `1px solid ${getStageColor(post.jobCandCurrStage).border}`,
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s ease'
                }}
              >
                            {post.jobCandCurrStage === '6y' && (
                              <span style={{ fontSize: '16px' }}>🎉</span>
                )}
                            {post.jobCandCurrStage === '6n' && (
                              <span style={{ fontSize: '16px' }}>😔</span>
                )}
                            {post.jobCandCurrStage === '6y' ? '최종 합격' : '최종 불합격'}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  ) : (
                <p>표시할 최종 결과가 없습니다.</p>
  )}
</div>
)}
        </div>
      </div>

      {/* 모달 렌더링 */}
      {isJobModalOpen && <JobSelectionModal onClose={closeJobModal} onSelectJob={handleJobSelected} />}
      {isRegionModalOpen && <RegionSelectionModal onClose={closeRegionModal} onSelectRegion={handleRegionSelected} />}
      {isSalaryModalOpen && <SalarySelectionModal onClose={closeSalaryModal} onSelectSalary={handleSalarySelected} />}
      {isCompanySizeModalOpen && <CompanySizeSelectionModal onClose={closeCompanySizeModal} onSelectCompanySize={handleCompanySizeSelected} />}
      {isCommuteTimeModalOpen && <CommuteTimeSelectionModal onClose={closeCommuteTimeModal} onSelectCommuteTime={handleCommuteTimeSelected} />}
      
      <BenefitSelectionModal
        isOpen={isBenefitModalOpen}
        onClose={closeBenefitModal}
        onSave={handleBenefitsSelected}
        selectedBenefits={selectedBenefits}
      />

      <InterviewSchedulerModal
        isOpen={isInterviewSchedulerModalOpen}
        onClose={closeInterviewSchedulerModal}
        postId={selectedPostIdForScheduling}
        candidateId={candidateId}
        onSchedule={handleInterviewScheduled}
      />

      <InterviewPreparationModal
        isOpen={isInterviewPreparationModalOpen}
        onClose={closeInterviewPreparationModal}
        postId={selectedPostIdForPreparation}
        candidateId={candidateId}
      />
    </div>
  );
}

export default CandidateDashboard;

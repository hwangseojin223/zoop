// CandidateDashboard.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// useAuth 훅을 임포트합니다. 실제 AuthContext 파일 경로에 맞게 수정해주세요.
import { useAuth } from '../../context/AuthContext.jsx';

import Sidebar from './Sidebar';
import Header from './Header';
import JobSelectionModal from './JobSelectionModal';
import RegionSelectionModal from './RegionSelectionModal';
import SalarySelectionModal from './SalarySelectionModal';
import CompanySizeSelectionModal from './CompanySizeSelectionModal';
import CommuteTimeSelectionModal from './CommuteTimeSelectionModal';
import InterviewSchedulerModal from './InterviewSchedulerModal'; 

import './CandidateDashboard.css';

function CandidateDashboard() {
  // useAuth 훅을 사용하여 인증 상태 정보를 가져옵니다.
  // authState 객체에 로그인 정보 (예: userId, userType, token)가 담겨 있다고 가정합니다.
  const { authState } = useAuth();

  const [userName, setUserName] = useState('게스트');
  const [activeTab, setActiveTab] = useState('all');

  // 백엔드에서 가져온 공고 목록 데이터를 저장할 상태
  const [jobPostings, setJobPostings] = useState([]);

  // 로그인한 사용자의 ID를 authState에서 가져옵니다.
  // authState.userId 또는 authState.candidateId 등 실제 필드명에 맞게 수정해주세요.
  // 로그인되지 않은 상태일 경우 authState.userId는 null 또는 undefined일 수 있습니다.
  const candidateId = authState.userId; // <-- 로그인한 사용자의 ID 사용

  // React Router의 navigate 훅 초기화
  const navigate = useNavigate();

  // 직무 선택 모달 상태 (localStorage 연동)
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(
    localStorage.getItem('selectedJob') || '직무선택해주세요'
  );

  // 지역 선택 모달 상태 (localStorage 연동)
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(
    localStorage.getItem('selectedRegion') || '입력해주세요'
  );

  // 연봉 선택 모달 상태 (localStorage 연동)
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(
    localStorage.getItem('selectedSalary') || '입력해주세요'
  );

  // 기업규모 선택 모달 상태 (새로 추가, localStorage 연동)
  const [isCompanySizeModalOpen, setIsCompanySizeModalOpen] = useState(false);
  const [selectedCompanySize, setSelectedCompanySize] = useState(
    localStorage.getItem('selectedCompanySize') || '입력해주세요'
  );

  // 출근소요시간 선택 모달 상태 (새로 추가, localStorage 연동)
  const [isCommuteTimeModalOpen, setIsCommuteTimeModalOpen] = useState(false);
  const [selectedCommuteTime, setSelectedCommuteTime] = useState(
    localStorage.getItem('selectedCommuteTime') || '입력해주세요'
  );

  // 나머지 입력값 상태 (현재 모달이 없으므로 '입력해주세요'로 고정)
  const [selectedIndustry, setSelectedIndustry] = useState('입력해주세요');
  const [selectedBenefit, setSelectedBenefit] = useState('입력해주세요');
  const [selectedWorkType, setSelectedWorkType] = useState('입력해주세요');

   // 현재 단계에 따라 다른 버튼을 렌더링하는 함수 추가
  const renderActionButton = (posting) => {
    switch(posting.jobCandCurrStage) {
      case '2n':
        return (
          <button 
            className="submit-portfolio-btn"
            onClick={() => navigate(`/portfolio-submission/${posting.postId}`)}
          >
            포트폴리오 제출하기
          </button>
        );
      case '3n':
        return (
          <button 
            className="schedule-interview-btn"
            onClick={() => navigate(`/interview-scheduling/${posting.postId}`)}
          >
            면접 일정 정하기
          </button>
        );
      // 다른 단계에 따른 버튼 추가 가능
      default:
        return null;
    }
  };

  const [isInterviewSchedulerModalOpen, setIsInterviewSchedulerModalOpen] = useState(false);
  const [selectedPostIdForScheduling, setSelectedPostIdForScheduling] = useState(null);

  // 컴포넌트가 처음 마운트되거나 candidateId가 변경될 때 데이터를 가져오는 useEffect 훅
  useEffect(() => {
    const fetchUserDataAndJobPostings = async () => {
      // candidateId가 유효한 값일 때만 API 호출을 시도합니다.
      // 로그인되지 않은 상태에서는 candidateId가 null/undefined일 수 있습니다.
      if (!candidateId) {
        console.log("Candidate ID is not available, skipping API call.");
        setUserName('로그인 필요'); // 로그인 정보가 없을 때 표시
        setJobPostings([]); // 목록 비우기
        return; // candidateId가 없으면 함수 실행 중단
      }

      try {
        // 사용자 이름 가져오는 로직 (기존 코드)
        // 실제로는 백엔드 API를 통해 사용자 이름을 가져오는 것이 좋습니다.
        // 예: fetch(`/api/candidates/${candidateId}/profile`).then(response => response.json()).then(data => setUserName(data.name));
        setTimeout(() => {
           // setUserName('김채원'); // 하드코딩된 이름 대신 실제 사용자 이름 사용 고려
           // 만약 authState에 사용자 이름 정보가 있다면 여기서 설정
           // if (authState.userName) setUserName(authState.userName);
        }, 500);


        // 백엔드 API 호출 시 로그인한 사용자의 candidateId 변수 사용
        // 실제 백엔드 서버가 실행 중이어야 합니다.
        const response = await fetch(`/api/candidates/${candidateId}/job-postings`); // candidateId 변수 사용
        if (!response.ok) {
          // HTTP 상태 코드가 200번대가 아니면 오류 처리
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json(); // 응답 본문을 JSON으로 파싱
        console.log(`Fetched Job Postings for candidate ${candidateId}:`, data); // 로그에 candidateId 포함
        setJobPostings(data); // 가져온 데이터를 jobPostings 상태에 저장

      } catch (error) {
        console.error('데이터 가져오기 오류:', error);
        setUserName('오류 발생'); // 사용자 이름 로딩 오류 처리
        setJobPostings([]); // 공고 목록 로딩 오류 시 빈 배열로 설정
      }
    };

    // candidateId 값이 변경될 때마다 effect 재실행
    // authState.userId (또는 해당 필드)가 변경될 때마다 이 effect가 다시 실행되어 새로운 사용자의 데이터를 가져옵니다.
    fetchUserDataAndJobPostings();
  }, [candidateId, authState.userId]); // 의존성 배열에 candidateId와 authState.userId 추가

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    console.log(`Tab selected: ${tabId}`);
    // TODO: 탭 변경 시 해당 탭에 맞는 공고 목록을 필터링하거나, 백엔드 API 호출 시 탭 정보를 넘겨줄 수 있습니다.
    // 현재는 모든 탭에서 동일한 전체 목록을 보여줍니다.
  };
  // 면접 일정 모달 관련 함수 추가
  const openInterviewSchedulerModal = (postId) => {
    setSelectedPostIdForScheduling(postId);
    setIsInterviewSchedulerModalOpen(true);
  };

  const closeInterviewSchedulerModal = () => {
    setIsInterviewSchedulerModalOpen(false);
    setSelectedPostIdForScheduling(null);
  };
  const handleInterviewScheduled = (dateTime, responseData) => {
    console.log('면접 일정이 저장되었습니다:', dateTime, responseData);
    alert(`면접 일정이 ${dateTime.toLocaleString('ko-KR')}으로 확정되었습니다.`);
    
    // 필요하다면 jobPostings 상태를 업데이트하여 UI 반영
    // 예: 해당 공고의 상태를 '3n'에서 '4n'으로 변경
    setJobPostings(prevPostings => 
      prevPostings.map(posting => 
        posting.postId === selectedPostIdForScheduling 
          ? { ...posting, jobCandCurrStage: '4n' } 
          : posting
      )
    );
  };

  // 포트폴리오 제출 페이지로 이동하는 함수
  const handleGoToSubmitPortfolio = (postId) => {
    console.log(`공고 ID ${postId}에 대한 포트폴리오 제출 페이지로 이동`);
    // React Router의 navigate 함수를 사용하여 포트폴리오 제출 페이지로 이동합니다.
    // URL 경로에 공고 ID를 포함시켜 제출 페이지에서 어떤 공고인지 알 수 있도록 합니다.
    navigate(`/submit-portfolio/${postId}`); // 실제 라우팅 경로에 맞게 수정
  };
  // 면접 일정 정하기 페이지로 이동하는 함수
  const handleGoToScheduleInterview = (postId) => {
      navigate(`/interview-scheduling/${postId}`);
  };


  // 직무 모달 관련 함수
  const openJobModal = () => {
    setIsJobModalOpen(true);
  };
  const closeJobModal = () => {
    setIsJobModalOpen(false);
  };
  const handleJobSelected = (job) => {
    setSelectedJob(job);
    localStorage.setItem('selectedJob', job);
  };

  // 지역 모달 관련 함수
  const openRegionModal = () => {
    setIsRegionModalOpen(true);
  };
  const closeRegionModal = () => {
    setIsRegionModalOpen(false);
  };
  const handleRegionSelected = (region) => {
    setSelectedRegion(region);
    localStorage.setItem('selectedRegion', region);
  };

  // 연봉 모달 관련 함수
  const openSalaryModal = () => {
    setIsSalaryModalOpen(true);
  };
  const closeSalaryModal = () => {
    setIsSalaryModalOpen(false);
  };
  const handleSalarySelected = (salary) => {
    setSelectedSalary(salary);
    localStorage.setItem('selectedSalary', salary);
  };

  // 기업규모 모달 관련 함수 (새로 추가)
  const openCompanySizeModal = () => {
    setIsCompanySizeModalOpen(true);
  };
  const closeCompanySizeModal = () => {
    setIsCompanySizeModalOpen(false);
  };
  const handleCompanySizeSelected = (size) => {
    setSelectedCompanySize(size);
    localStorage.setItem('selectedCompanySize', size);
  };

  // 출근소요시간 모달 관련 함수 (새로 추가)
  const openCommuteTimeModal = () => {
    setIsCommuteTimeModalOpen(true);
  };
  const closeCommuteTimeModal = () => {
    setIsCommuteTimeModalOpen(false);
  };
  const handleCommuteTimeSelected = (time) => {
    setSelectedCommuteTime(time);
    localStorage.setItem('selectedCommuteTime', time);
  };


  return (
    <div className="candidate-dashboard-wrapper">
      <Sidebar />

      <div className="main-content-area">
        {/* Header 컴포넌트에 userName 전달 */}
        <Header userName={userName} />

        <h1 className="page-title">포지션 제안 현황</h1>

        <div className="info-box company-proposal">
          <p>
            <span className="icon">✨</span> 기업에게 포지션 제안을 받는 중입니다.
          </p>
          <button className="highlight-button">
            이력서 하이라이트 신청하기 <span className="arrow-right">›</span>
          </button>
        </div>

        {/* Search/Filter Section */}
        <div className="filter-section">
          <div className="filter-row">
            <span className="label">희망 근무 조건</span>
            <div className="tags">
              <span className="tag static-tag">직무</span>
              <span className="tag blue interactive-tag" onClick={openJobModal}>
                {selectedJob}
              </span>
              <span className="tag static-tag">지역</span>
              <span className="tag blue interactive-tag" onClick={openRegionModal}>
                {selectedRegion}
              </span>

            </div>
          </div>

          {/* 두 번째 filter-row 구조 변경 (연봉 클릭 기능 추가) */}
          <div className="filter-row second-row">
            <span className="tag static-tag">연봉</span>
            <span className="tag blue interactive-tag" onClick={openSalaryModal}>
              {selectedSalary}
            </span>
            <span className="tag static-tag">복리후생</span>
            <span className="tag blue interactive-tag">
              {selectedBenefit}
            </span>
            <span className="tag static-tag">기업규모</span>
            <span className="tag blue interactive-tag" onClick={openCompanySizeModal}>
              {selectedCompanySize}
            </span>
            <span className="tag static-tag">출근소요시간</span>
            <span className="tag blue interactive-tag" onClick={openCommuteTimeModal}>
              {selectedCommuteTime}
            </span>
          </div>
        </div>


        {/* Tabs and Content Area */}
        <div className="tabs-container">
          <div className="tabs">
            <button
              className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => handleTabClick('all')}
            >
              전체
            </button>
            <button
              className={`tab-button ${activeTab === 'positionOffer' ? 'active' : ''}`}
              onClick={() => handleTabClick('positionOffer')}
            >
              포지션 제안
            </button>
            <button
              className={`tab-button ${activeTab === 'interviewOffer' ? 'active' : ''}`}
              onClick={() => handleTabClick('interviewOffer')}
            >
              면접 제안
            </button>
            <button
              className={`tab-button ${activeTab === 'resultAnnouncement' ? 'active' : ''}`}
              onClick={() => handleTabClick('resultAnnouncement')}
            >
              결과발표
            </button>
          </div>

          <div className="filter-options">
            <select className="dropdown">
              <option>지난 1년</option>
            </select>
            <select className="dropdown">
              <option>확인안한 제안 제외</option>
            </select>
            <select className="dropdown">
              <option>20개씩</option>
            </select>
          </div>
        </div>

        {/* Tab Content - 공고 목록 표시 */}
        <div className="tab-content">
          {/* activeTab에 따라 다른 목록을 보여줄 수 있지만, 여기서는 전체 목록 예시 */}
          {/* 실제로는 activeTab에 따라 jobPostings 상태를 필터링하여 표시해야 합니다. */}
          {activeTab === 'all' && (
            <div>
              {/* jobPostings 상태에 데이터가 있는지 확인하고 목록을 렌더링 */}
              {jobPostings.length > 0 ? (
                <ul>
                  {/* jobPostings 배열을 순회하며 각 공고 항목을 렌더링 */}
                  {jobPostings.map(post => (
                    <li key={post.postId} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px', marginBottom: '10px' }}>
                      <h3>{post.postTitle}</h3>
                      <p>회사: {post.companyName}</p>
                      <p>지역: {post.postLocation}</p>
                      {/* <p>현재 진행 단계: {post.jobCandCurrStage}</p> */}
                      {/* 포트폴리오 제출 버튼 - 클릭 시 handleGoToSubmitPortfolio 함수 호출 */}
                      {/* TODO: jobCandCurrStage가 '서류제출대기' 등 제출 가능한 상태일 때만 버튼을 표시하도록 조건부 렌더링 추가 */}
                      {/* 예: {post.jobCandCurrStage === '서류제출대기' && ( ... 버튼 코드 ... )} */}
                      {post.jobCandCurrStage === '2n' && (
                        <button onClick={() => handleGoToSubmitPortfolio(post.postId)}>
                        포트폴리오 제출하기
                      </button>
                      )}
                      {post.jobCandCurrStage === '3n' && (
                        <button onClick={() => openInterviewSchedulerModal(post.postId)}>
    면접 일정 정하기
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                // jobPostings 배열이 비어있을 때 표시할 내용
                <p>표시할 공고가 없습니다.</p>
              )}
            </div>
          )}
          {/* 다른 탭 콘텐츠는 유사한 방식으로 구현 */}
          {activeTab === 'positionOffer' && (
                // TODO: jobPostings 상태를 필터링하여 '포지션 제안' 상태인 공고만 표시
                <p>포지션 제안 목록이 여기에 표시됩니다.</p>
              )}
              {activeTab === 'interviewOffer' && (
                 // TODO: jobPostings 상태를 필터링하여 '면접 제안' 상태인 공고만 표시
                <p>면접 제안 목록이 여기에 표시됩니다.</p>
              )}
              {activeTab === 'resultAnnouncement' && (
                 // TODO: jobPostings 상태를 필터링하여 '결과 발표' 상태인 공고만 표시
                <p>결과 발표 목록이 여기에 표시됩니다.</p>
              )}
        </div>
      </div>

      {/* 모달 렌더링 */}
      {isJobModalOpen && (<JobSelectionModal onClose={closeJobModal} onSelectJob={handleJobSelected} />)}
      {isRegionModalOpen && (<RegionSelectionModal onClose={closeRegionModal} onSelectRegion={handleRegionSelected} />)}
      {isSalaryModalOpen && (<SalarySelectionModal onClose={closeSalaryModal} onSelectSalary={handleSalarySelected} />)}
      {isCompanySizeModalOpen && (<CompanySizeSelectionModal onClose={closeCompanySizeModal} onSelectCompanySize={handleCompanySizeSelected} />)}
      {isCommuteTimeModalOpen && (<CommuteTimeSelectionModal onClose={closeCommuteTimeModal} onSelectCommuteTime={handleCommuteTimeSelected} />)}
      {/* 면접 일정 모달 추가 */}
      {isInterviewSchedulerModalOpen && (<InterviewSchedulerModal
    isOpen={isInterviewSchedulerModalOpen}
    onClose={closeInterviewSchedulerModal}
    onSelectDateTime={handleInterviewScheduled}
    postId={selectedPostIdForScheduling}
    candidateId={candidateId}
  />
)}
    </div>
  );
}

export default CandidateDashboard;

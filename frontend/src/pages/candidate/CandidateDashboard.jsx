import React, { useState, useEffect } from 'react'; // ① useState와 useEffect 훅을 임포트해야 합니다.
import Sidebar from './Sidebar';
import Header from './Header';
import './CandidateDashboard.css';

function CandidateDashboard() {
  // ② 사용자 이름 상태를 추가합니다.
  const [userName, setUserName] = useState('게스트');

  // ③ 탭 선택 상태를 관리할 새로운 useState 훅을 추가합니다.
  const [activeTab, setActiveTab] = useState('all'); // 기본값: 'all' (전체)

  // ④ 컴포넌트가 마운트될 때 사용자 정보를 가져오는 useEffect 훅
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 실제 백엔드 API 호출을 여기에 구현합니다.
        // 예시:
        // const response = await fetch('/api/me');
        // const data = await response.json();
        // if (response.ok) {
        //   setUserName(data.userName);
        // } else {
        //   console.error('Failed to fetch user data:', data.message);
        //   setUserName('사용자');
        // }

        // 백엔드 연동 전 임시 데이터 (실제 사용 시 제거)
        setTimeout(() => {
          setUserName('김채원'); // 여기에 실제 로그인한 사용자 이름을 설정합니다.
        }, 500); // 짧은 지연
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserName('오류 발생');
      }
    };

    fetchUserData();
  }, []); // 빈 배열은 컴포넌트 마운트 시 한 번만 실행됨을 의미합니다.

  // ⑤ 탭 클릭 핸들러 함수를 추가합니다.
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    // 선택된 탭에 따라 다른 콘텐츠를 로드하는 로직을 여기에 추가할 수 있습니다.
    console.log(`Tab selected: ${tabId}`);
  };

  return (
    <div className="candidate-dashboard-wrapper">
      {/* Sidebar 컴포넌트 */}
      <Sidebar />

      <div className="main-content-area">
        {/* Header 컴포넌트에 userName prop을 전달합니다. */}
        <Header userName={userName} />

        {/* --- Content previously from MainContent.jsx starts here --- */}
        <h1 className="page-title">포지션 제안 현황</h1>

        {/* Top Info Box */}
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
              <span className="tag">직무</span>
              <span className="tag blue">직무선택해주세요</span>
              <span className="tag">지역</span>
              <span className="tag blue">입력해주세요</span>
              <span className="tag">업종</span>
              <span className="tag blue">입력해주세요</span>
            </div>
          </div>
          <div className="filter-row">
            <span className="label">연봉</span>
            <span className="tag blue">입력해주세요</span>
            <span className="label">복리후생</span>
            <span className="tag blue">입력해주세요</span>
            <span className="label">근무 형태</span>
            <span className="tag blue">입력해주세요</span>
            <span className="label">기업규모</span>
            <span className="tag blue">입력해주세요</span>
            <button className="modify-button">수정</button>
          </div>
          <div className="filter-row">
            <span className="label">출근소요시간</span>
            <span className="tag blue">입력해주세요</span>
          </div>
        </div>

        {/* Call to Action for Highlight */}
        <div className="call-to-action">
          <p>남들보다 빠르게 제안 받고 싶다면?</p>
          <button className="highlight-cta-button">
            <span className="icon">✨</span> 이력서 하이라이트!
          </button>
        </div>

        {/* Tabs and Content Area */}
        <div className="tabs-container">
          <div className="tabs">
            {/* 각 버튼에 className을 동적으로 부여하고 onClick 핸들러를 추가합니다. */}
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

        {/* 선택된 탭에 따라 다른 콘텐츠를 표시하는 부분 (예시) */}
        {/* activeTab 상태에 따라 다른 컴포넌트나 내용을 렌더링할 수 있습니다. */}
        {activeTab === 'all' && (
          <div className="tab-content">
            {/* 전체 탭에 해당하는 내용 */}
            <p>전체 제안 목록이 여기에 표시됩니다.</p>
          </div>
        )}
        {activeTab === 'positionOffer' && (
          <div className="tab-content">
            {/* 포지션 제안 탭에 해당하는 내용 */}
            <p>포지션 제안 목록이 여기에 표시됩니다.</p>
          </div>
        )}
        {activeTab === 'interviewOffer' && (
          <div className="tab-content">
            {/* 면접 제안 탭에 해당하는 내용 */}
            <p>면접 제안 목록이 여기에 표시됩니다.</p>
          </div>
        )}
        {activeTab === 'resultAnnouncement' && (
          <div className="tab-content">
            {/* 결과 발표 탭에 해당하는 내용 */}
            <p>결과 발표 목록이 여기에 표시됩니다.</p>
          </div>
        )}


        {/* 기존의 empty-state는 이제 조건부 렌더링 내부에 두거나, 필요에 따라 조정 */}
        {/* <div className="empty-state">
          <img src="/path/to/empty_state_image.png" alt="No content" className="empty-image" />
        </div> */}
        {/* --- Content previously from MainContent.jsx ends here --- */}

      </div>
    </div>
  );
}

export default CandidateDashboard;
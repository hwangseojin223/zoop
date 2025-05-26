import React from 'react';
import Sidebar from './Sidebar'; // Import Sidebar from the same directory
import Header from './Header';   // Import Header from the same directory
import './CandidateDashboard.css'; // This CSS file will now contain styles for the main content too

function CandidateDashboard() {
  return (
    <div className="candidate-dashboard-wrapper"> {/* Renamed for clarity: this wraps the whole layout */}
      <Sidebar />
      <div className="main-content-area"> {/* This div will now hold the content previously in MainContent */}
        <Header /> {/* Header is part of the main content area layout */}

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
            <button className="tab-button active">전체</button>
            <button className="tab-button">포지션 제안</button>
            <button className="tab-button">면접 제안</button>
            <button className="tab-button">결과발표</button>
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

        {/* No content area (placeholder image) */}
        <div className="empty-state">
          <img src="/path/to/empty_state_image.png" alt="No content" className="empty-image" />
          {/* Placeholder for "No content" text if any */}
        </div>
        {/* --- Content previously from MainContent.jsx ends here --- */}

      </div>
    </div>
  );
}

export default CandidateDashboard;
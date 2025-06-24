// src/pages/candidate/Sidebar.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const [expandedMenuId, setExpandedMenuId] = useState(null); // 올바른 변수명

  const handleMenuItemClick = (menuId) => {
    setExpandedMenuId(expandedMenuId === menuId ? null : menuId);
  };

  return (
    <div className="sidebar">
      <Link to="/" className="logo-link">
        <div className="logo">
          <img src="../../logo_zoop.png" alt="zoop" />
        </div>
      </Link>

      <ul className="menu-list">
        {/* 'My 홈' 메뉴 아이템 */}
        <li
          className={`menu-item ${expandedMenuId === 'myHome' ? 'active' : ''}`}
          onClick={() => handleMenuItemClick('myHome')}
        >
          <span className="icon"></span> My 홈
          <span className="arrow">{expandedMenuId === 'myHome' ? '▲' : '▼'}</span>
          {expandedMenuId === 'myHome' && (
            <ul className="sub-menu">
              <li className="sub-menu-item active">계정정보 설정</li>
              <li className="sub-menu-item">비밀번호 변경</li>
              <li className="sub-menu-item">로그인 관리</li>
              <li className="sub-menu-item">알림설정</li>
              <li className="sub-menu-item">로그아웃</li>
            </ul>
          )}
        </li>

        {/* '받은 제안' 메뉴 아이템 */}
        <li
          className={`menu-item ${expandedMenuId === 'receivedProposals' ? 'active' : ''}`}
          onClick={() => handleMenuItemClick('receivedProposals')}
        >
          <span className="icon">📝</span> 받은 제안
          <span className="arrow">{expandedMenuId === 'receivedProposals' ? '▲' : '▼'}</span>
          {expandedMenuId === 'receivedProposals' && (
            <ul className="sub-menu">
              <li className="sub-menu-item active">포지션 제안 현황</li>
              <li className="sub-menu-item">이력서 열람 현황</li>
            </ul>
          )}
        </li>

        {/* '이력서/자소서' 메뉴 아이템 */}
        <li
          className={`menu-item ${expandedMenuId === 'resumeCoverLetter' ? 'active' : ''}`}
          onClick={() => handleMenuItemClick('resumeCoverLetter')}
        >
          <span className="icon">✉️</span> 이력서/자소서
          <span className="arrow">{expandedMenuId === 'resumeCoverLetter' ? '▲' : '▼'}</span>
          {expandedMenuId === 'resumeCoverLetter' && (
            <ul className="sub-menu">
              <li className="sub-menu-item active">이력서 등록</li>
              <li className="sub-menu-item">이력서 관리</li>
              <li className="sub-menu-item">자소서 관리</li>
            </ul>
          )}
        </li>

        <li className="menu-item">
          <span className="icon">🎤</span> 스크랩/관심기업
        </li>

        {/* '지원한 공고' 메뉴 아이템 */}
        <li
          className={`menu-item ${expandedMenuId === 'appliedJobs' ? 'active' : ''}`}
          onClick={() => handleMenuItemClick('appliedJobs')}
        >
          <span className="icon">🔍</span> 지원한 공고
          <span className="arrow">{expandedMenuId === 'appliedJobs' ? '▲' : '▼'}</span>
          {expandedMenuId === 'appliedJobs' && ( // <-- 이 부분을 'expandedId'에서 'expandedMenuId'로 수정했습니다.
            <ul className="sub-menu">
              <li className="sub-menu-item">내 지원 현황</li>
              <li className="sub-menu-item">기업별 지원 내역</li>
            </ul>
          )}
        </li>

        <li className="menu-item">
          <span className="icon">⚙️</span> 제안받기 설정
        </li>

        {/* '지원내역' 메뉴 아이템 */}
        <li
          className={`menu-item ${expandedMenuId === 'applicationHistory' ? 'active' : ''}`}
          onClick={() => handleMenuItemClick('applicationHistory')}
        >
          <span className="icon">📄</span> 지원내역
          <span className="arrow">{expandedMenuId === 'applicationHistory' ? '▲' : '▼'}</span>
          {expandedMenuId === 'applicationHistory' && (
            <ul className="sub-menu">
              {/* 여기에 '지원내역' 관련 하위 메뉴 아이템들을 추가하세요 */}
            </ul>
          )}
        </li>
        <li className="menu-item has-badge">
          <span className="icon">🤝</span> 면접관리 <span className="new-badge">NEW</span>
        </li>
        <li className="menu-item">
          <span className="icon">💲</span> 결제 내역
        </li>
        <li className="menu-item">
          <span className="icon">📁</span> 내 쿠폰
        </li>

        {/* '커리어 마일리지' 메뉴 아이템 */}
        <li
          className={`menu-item ${expandedMenuId === 'careerMileage' ? 'active' : ''}`}
          onClick={() => handleMenuItemClick('careerMileage')}
        >
          <span className="icon">📧</span> 커리어 마일리지
          <span className="arrow">{expandedMenuId === 'careerMileage' ? '▲' : '▼'}</span>
          {expandedMenuId === 'careerMileage' && (
            <ul className="sub-menu">
              {/* 여기에 '커리어 마일리지' 관련 하위 메뉴 아이템들을 추가하세요 */}
            </ul>
          )}
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
import React, { useState } from 'react'; // ① useState 훅을 임포트합니다.
import './Sidebar.css';

function Sidebar() {
  // ② 어떤 메뉴가 현재 펼쳐져 있는지 추적하는 상태를 정의합니다.
  // null은 아무 메뉴도 펼쳐져 있지 않음을 의미합니다.
  const [expandedMenuId, setExpandedMenuId] = useState(null); // 초기값: 아무것도 펼치지 않음

  // ③ 메뉴 아이템 클릭 핸들러 함수
  const handleMenuItemClick = (menuId) => {
    // 클릭된 메뉴가 이미 펼쳐져 있다면 닫고 (null로 설정),
    // 닫혀있다면 해당 메뉴를 펼칩니다.
    setExpandedMenuId(expandedMenuId === menuId ? null : menuId);
  };

  return (
    <div className="sidebar">
      <div className="logo">
        <img src="../../logo_zoop.png" alt="zoop" />
      </div>
      <ul className="menu-list">
        {/* 일반 메뉴 아이템 (하위 메뉴 없음) */}
        <li className="menu-item">MY홈</li>

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
        <li className="menu-item has-badge">
          <span className="icon">✉️</span> 이력서/자소서 <span className="new-badge">NEW</span>
        </li>
        <li className="menu-item">
          <span className="icon">🎤</span> 스크랩/관심기업
        </li>

        {/* 하위 메뉴가 있는 메뉴 아이템 */}
        <li
          className={`menu-item ${expandedMenuId === 'appliedJobs' ? 'active' : ''}`} // ④ active 클래스 동적 추가
          onClick={() => handleMenuItemClick('appliedJobs')} // ⑤ 클릭 이벤트 핸들러 추가
        >
          <span className="icon">🔍</span> 지원한 공고
          {/* ⑥ 펼쳐진 상태에 따라 화살표 방향 변경 */}
          <span className="arrow">{expandedMenuId === 'appliedJobs' ? '▲' : '▼'}</span>
          {/* ⑦ expandedMenuId가 'appliedJobs'일 때만 하위 메뉴 렌더링 */}
          {expandedMenuId === 'appliedJobs' && (
            <ul className="sub-menu">
              {/* 여기에 '지원한 공고' 관련 하위 메뉴 아이템들을 추가하세요 */}
              <li className="sub-menu-item">내 지원 현황</li>
              <li className="sub-menu-item">기업별 지원 내역</li>
            </ul>
          )}
        </li>

        

        <li className="menu-item">
          <span className="icon">⚙️</span> 제안받기 설정
        </li>

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
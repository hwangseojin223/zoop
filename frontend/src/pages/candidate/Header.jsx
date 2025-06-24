// Header.jsx

import React, { useEffect, useState } from 'react';
import './Header.css';
import { useAuth } from '../../context/AuthContext'; // AuthContext 경로 확인
import { useNavigate } from 'react-router-dom';

function Header() {
  // 초기 상태를 '아이디' 대신 빈 문자열이나 null로 설정하는 것이 좋습니다.
  const [displayedUserName, setDisplayedUserName] = useState('');
  const { authState, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // authState에 loginId 또는 userName 정보가 있다면 표시
    if (authState?.loginId) { // authState에 loginId가 있다면
      setDisplayedUserName(authState.loginId); // loginId를 표시
    } else if (authState?.userName) { // loginId는 없지만 userName이 있다면
       setDisplayedUserName(authState.userName); // userName을 표시
    } else {
      // 로그인 정보가 없을 때
      setDisplayedUserName('게스트');
    }
  }, [authState]); // authState가 변경될 때마다 실행

  // 로그아웃 처리 함수
  const handleLogout = () => {
    if (logout) {
      logout();
      console.log("로그아웃 되었습니다.");
      navigate('/auth/login'); // 실제 로그인 페이지 경로로 수정
    } else {
      console.error("AuthContext에서 logout 함수를 찾을 수 없습니다.");
      // AuthContext에 logout 함수가 없다면 로컬 스토리지 직접 삭제 및 이동
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('userId');
      localStorage.removeItem('loginId'); // <-- loginId도 제거
      localStorage.removeItem('userName'); // <-- userName도 제거
      navigate('/auth/login'); // 실제 로그인 페이지 경로로 수정
    }
  };

  return (
    <div className="header">
      <div className="header-left">
        {/* Placeholder for menu icon if needed */}
      </div>
      <div className="header-right">
        <span className="header-icon" aria-label="알림">🔔</span>
        <span className="header-icon" aria-label="메시지">✉️</span>
        <span className="header-icon" aria-label="채팅">💬</span>
        <div className="user-profile">
          {/* 표시할 사용자 정보 (로그인 ID 또는 이름) */}
          <span>{displayedUserName}</span>
          <img src="../../person.png" alt="User Avatar" className="user-avatar" />
          {/* 로그인 상태일 때만 로그아웃 버튼을 표시 */}
          {authState?.token && (
             <button onClick={handleLogout} className="logout-button">
               로그아웃
             </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;

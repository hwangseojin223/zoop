import React, { useEffect, useState, useRef } from 'react';
import './PortfolioNavbar.css';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function PortfolioNavbar() {
  const [displayedUserName, setDisplayedUserName] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (authState?.loginId) {
      setDisplayedUserName(authState.loginId);
    } else if (authState?.userName) {
       setDisplayedUserName(authState.userName);
    } else {
      setDisplayedUserName('게스트');
    }
  }, [authState]);

  // 드롭다운 외부 클릭 감지 로직
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  // 로그아웃 처리 함수
  const handleLogout = () => {
    if (logout) {
      logout();
      console.log("로그아웃 되었습니다.");
      navigate('/auth/login');
    } else {
      console.error("AuthContext에서 logout 함수를 찾을 수 없습니다.");
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('userId');
      localStorage.removeItem('loginId');
      localStorage.removeItem('userName');
      navigate('/auth/login');
    }
    setIsDropdownOpen(false);
  };

  // 드롭다운 토글 함수
  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  // 마이페이지, 설정 등 클릭 핸들러
  const handleMenuItemClick = (path) => {
    navigate(path);
    setIsDropdownOpen(false);
  };

  return (
    <div className="portfolio-navbar">
      <div className="portfolio-navbar-right">
        <span className="portfolio-navbar-icon" aria-label="알림">
          <img src="../../icons/bell.svg" alt="알림" />
        </span>
        <span className="portfolio-navbar-icon" aria-label="메시지">
          <img src="../../icons/mail.svg" alt="메시지" />
        </span>
        <span className="portfolio-navbar-icon" aria-label="채팅">
          <img src="../../icons/message-circle.svg" alt="채팅" />
        </span>
        {/* User Profile Area */}
        <div className="portfolio-user-profile" onClick={toggleDropdown} ref={dropdownRef}>
          <img src="../../person.png" alt="User Avatar" className="portfolio-user-avatar" />
          <span>{displayedUserName}</span>

          {/* 드롭다운 메뉴 */}
          {isDropdownOpen && (
            <div className="portfolio-dropdown-menu">
              <div className="portfolio-dropdown-item" onClick={() => handleMenuItemClick('/candidate/dashboard')}>마이페이지</div>
              <div className="portfolio-dropdown-item" onClick={() => handleMenuItemClick('/settings')}>설정</div>
              {authState?.token && (
                <div className="portfolio-dropdown-item portfolio-logout-dropdown-item" onClick={handleLogout}>
                  로그아웃
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PortfolioNavbar; 
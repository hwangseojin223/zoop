import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { authState, setAuthState } = useAuth();

  const handleLogoClick = () => {
    if (authState.token) {
      navigate('/company/dashboard'); // 로그인 O → 대시보드
    } else {
      navigate('/'); // 로그인 X → 인덱스
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    setAuthState({ token: null, userType: null, userId: null });
    navigate('/auth/login');
  };

  return (
    <header className="zoop-navbar">
      <img
        src="/logo_zoop.png"
        alt="logo"
        className="logo-img"
        style={{ cursor: 'pointer' }}
        onClick={handleLogoClick}
      />

      <nav className="nav-links">
        <a href="#">회사 소개</a>
        <a href="#">공지사항</a>
        <a href="#">고객센터</a>
        <a href="#">자주 묻는 질문</a>
        <a href="#">채용</a>
      </nav>

      <div className="auth-buttons">
        {authState.token ? (
          <button className="btn-filled" onClick={handleLogout}>
            로그아웃
          </button>
        ) : (
          <>
            <button className="btn-outline" onClick={() => navigate('/auth/applicant/signup')}>
              회원가입
            </button>
            <button className="btn-filled" onClick={() => navigate('/auth/login')}>
              로그인
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = ({ onLangChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authState, setAuthState } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navbarRef = useRef(null);

  const isAboutPage = location.pathname === '/about';

  // 외부 클릭으로 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // 리사이즈 시 메뉴 자동 닫기
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [menuOpen]);

  // 스크롤 시 blur 클래스 적용
  useEffect(() => {
    if (!isAboutPage) return;
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAboutPage]);

  const handleLogoClick = () => {
    setMenuOpen(false);
    if (authState.token) {
      if (authState.userType === 'candidate') navigate('/candidate/dashboard');
      else if (authState.userType === 'company') navigate('/company/dashboard');
      else navigate('/');
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setAuthState({ token: null, userType: null, userId: null, loginId: null });
    navigate('/auth/login');
    setMenuOpen(false);
  };

  const handleMenuItemClick = (path) => {
    setMenuOpen(false);
    if (path) navigate(path);
  };

  return (
    <header
      className={`zoop-navbar ${isAboutPage ? `about${scrolled ? ' scrolled' : ''}` : ''}`}
      ref={navbarRef}
    >
      <img src="/logo_zoop.png" alt="zoop 로고" className="logo-img" onClick={handleLogoClick} />

      <button
        className="hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="모바일 메뉴 열기"
      >
        ☰
      </button>

      <nav className="nav-links desktop-only">
        <a onClick={() => handleMenuItemClick('/about')}>회사 소개</a>
        <a onClick={() => handleMenuItemClick('/notice')}>공지사항</a>
        <a onClick={() => handleMenuItemClick('/support')}>고객센터</a>
        <a onClick={() => handleMenuItemClick('/faq')}>자주 묻는 질문</a>
        <a onClick={() => handleMenuItemClick('/careers')}>채용</a>
      </nav>

      <div className="auth-buttons desktop-only">
        {isAboutPage ? (
          <span>
            <button
              onClick={() => onLangChange('ko')}
              style={{
                background: "none",
                border: "none",
                color: "inherit",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "1em"
              }}
            >
              KOR
            </button>
            {' | '}
            <button
              onClick={() => onLangChange('en')}
              style={{
                background: "none",
                border: "none",
                color: "inherit",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "1em"
              }}
            >
              ENG
            </button>
          </span>
        ) : authState.token ? (
          <button className="btn-filled" onClick={handleLogout}>로그아웃</button>
        ) : (
          <>
            <button className="btn-outline" onClick={() => navigate('/auth/applicant/signup')}>회원가입</button>
            <button className="btn-filled" onClick={() => navigate('/auth/login')}>로그인</button>
          </>
        )}
      </div>

      <div className={`mobile-menu ${menuOpen ? 'active' : ''}`} aria-hidden={!menuOpen}>
        <nav className="nav-links mobile-only">
          <a onClick={() => handleMenuItemClick('/about')}>회사 소개</a>
          <a onClick={() => handleMenuItemClick('/notice')}>공지사항</a>
          <a onClick={() => handleMenuItemClick('/support')}>고객센터</a>
          <a onClick={() => handleMenuItemClick('/faq')}>자주 묻는 질문</a>
          <a onClick={() => handleMenuItemClick('/careers')}>채용</a>
        </nav>

        <div className="auth-buttons mobile-only">
          {isAboutPage ? (
            <span>
              <button
                onClick={() => onLangChange('ko')}
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "1em"
                }}
              >
                KOR
              </button>
              {' | '}
              <button
                onClick={() => onLangChange('en')}
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "1em"
                }}
              >
                ENG
              </button>
            </span>
          ) : authState.token ? (
            <button className="btn-filled" onClick={handleLogout}>로그아웃</button>
          ) : (
            <>
              <button className="btn-outline" onClick={() => handleMenuItemClick('/auth/applicant/signup')}>회원가입</button>
              <button className="btn-filled" onClick={() => handleMenuItemClick('/auth/login')}>로그인</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

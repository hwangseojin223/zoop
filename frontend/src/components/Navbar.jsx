import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';
import { AccessibleButton, AccessibleLink, ScreenReaderOnly } from './Accessibility';

const Navbar = ({ onLangChange, hideAuth }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authState, setAuthState } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [displayedUserName, setDisplayedUserName] = useState('');
  const navbarRef = useRef(null);
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);

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

  // 사용자 이름 설정
  useEffect(() => {
    if (authState?.loginId) {
      setDisplayedUserName(authState.loginId);
    } else if (authState?.userName) {
      setDisplayedUserName(authState.userName);
    } else {
      setDisplayedUserName('게스트');
    }
  }, [authState]);

  // 드롭다운 외부 클릭 감지
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

  // 키보드 네비게이션
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'Escape':
        setMenuOpen(false);
        break;
      case 'Enter':
      case ' ':
        if (e.target.tagName === 'BUTTON') {
          e.preventDefault();
          e.target.click();
        }
        break;
      default:
        break;
    }
  };

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
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  const handleMenuItemClick = (path) => {
    setMenuOpen(false);
    setIsDropdownOpen(false);
    if (path) {
      // 고객센터와 자주 묻는 질문은 새탭에서 열기
      if (path === '/support') {
        window.open(path, '_blank');
      } else {
        navigate(path);
      }
    }
  };

  return (
    <header
      className={`zoop-navbar ${isAboutPage ? `about${scrolled ? ' scrolled' : ''}` : ''}`}
      ref={navbarRef}
      role="banner"
      aria-label="메인 네비게이션"
    >
      <AccessibleButton
        className="logo-button"
        onClick={handleLogoClick}
        ariaLabel="ZOOP 홈으로 이동"
        onKeyDown={handleKeyDown}
      >
        <img 
          src="/logo_zoop.png" 
          alt="ZOOP 로고" 
          className="logo-img" 
        />
      </AccessibleButton>

      <AccessibleButton
        className="hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        ariaLabel={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
        ariaExpanded={menuOpen}
        ariaControls="main-menu"
        onKeyDown={handleKeyDown}
      >
        <ScreenReaderOnly>메뉴</ScreenReaderOnly>
        ☰
      </AccessibleButton>

      <nav 
        className="nav-links desktop-only"
        role="navigation"
        aria-label="메인 메뉴"
        id="main-menu"
        ref={menuRef}
      >
        <AccessibleLink
          onClick={() => handleMenuItemClick('/about')}
          ariaLabel="회사 소개"
          role="menuitem"
        >
          회사 소개
        </AccessibleLink>
        <AccessibleLink
          onClick={() => handleMenuItemClick('/notice')}
          ariaLabel="공지사항"
          role="menuitem"
        >
          공지사항
        </AccessibleLink>
        <AccessibleLink
          onClick={() => handleMenuItemClick('/support')}
          ariaLabel="고객센터 (새 창에서 열림)"
          external={true}
          role="menuitem"
        >
          고객센터
        </AccessibleLink>
        <AccessibleLink
          onClick={() => handleMenuItemClick('/faq')}
          ariaLabel="자주 묻는 질문"
          role="menuitem"
        >
          자주 묻는 질문
        </AccessibleLink>
        <AccessibleLink
          onClick={() => handleMenuItemClick('/careers')}
          ariaLabel="채용"
          role="menuitem"
        >
          채용
        </AccessibleLink>
      </nav>

      {/* 모바일 메뉴 */}
      {menuOpen && (
        <nav 
          className="mobile-menu"
          role="navigation"
          aria-label="모바일 메뉴"
          aria-hidden="false"
        >
          <AccessibleLink
            onClick={() => handleMenuItemClick('/about')}
            ariaLabel="회사 소개"
            role="menuitem"
            tabIndex="0"
          >
            회사 소개
          </AccessibleLink>
          <AccessibleLink
            onClick={() => handleMenuItemClick('/notice')}
            ariaLabel="공지사항"
            role="menuitem"
            tabIndex="0"
          >
            공지사항
          </AccessibleLink>
          <AccessibleLink
            onClick={() => handleMenuItemClick('/support')}
            ariaLabel="고객센터 (새 창에서 열림)"
            external={true}
            role="menuitem"
            tabIndex="0"
          >
            고객센터
          </AccessibleLink>
          <AccessibleLink
            onClick={() => handleMenuItemClick('/faq')}
            ariaLabel="자주 묻는 질문"
            role="menuitem"
            tabIndex="0"
          >
            자주 묻는 질문
          </AccessibleLink>
          <AccessibleLink
            onClick={() => handleMenuItemClick('/careers')}
            ariaLabel="채용"
            role="menuitem"
            tabIndex="0"
          >
            채용
          </AccessibleLink>
          
          {authState.token ? (
            <>
              <div className="mobile-user-info">
                <img src="/person.png" alt="User Avatar" className="mobile-user-avatar" />
                <span className="mobile-user-name">{displayedUserName}</span>
              </div>
              <AccessibleButton
                onClick={() => handleMenuItemClick('/mypage')}
                ariaLabel="마이페이지"
                role="menuitem"
                tabIndex="0"
                className="mobile-menu-item"
              >
                마이페이지
              </AccessibleButton>
              <AccessibleButton
                onClick={() => handleMenuItemClick('/settings')}
                ariaLabel="설정"
                role="menuitem"
                tabIndex="0"
                className="mobile-menu-item"
              >
                설정
              </AccessibleButton>
              <AccessibleButton
                onClick={handleLogout}
                ariaLabel="로그아웃"
                role="menuitem"
                tabIndex="0"
                className="mobile-menu-item logout"
              >
                로그아웃
              </AccessibleButton>
            </>
          ) : (
            <AccessibleLink
              onClick={() => handleMenuItemClick('/auth/login')}
              ariaLabel="로그인"
              role="menuitem"
              tabIndex="0"
            >
              로그인
            </AccessibleLink>
          )}
        </nav>
      )}

      {/* 언어 변경 버튼 - hideAuth가 true여도 표시 */}
      {onLangChange && (
        <div className="lang-toggle desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'absolute', right: '12rem', top: '50%', transform: 'translateY(-50%)' }}>
          <button
            className="lang-btn"
            style={{
              fontWeight: (window.location.pathname === '/about' && (window.localStorage.getItem('aboutLang') || 'ko') === 'ko') ? 'bold' : 'normal',
              color: (window.location.pathname === '/about' && (window.localStorage.getItem('aboutLang') || 'ko') === 'ko') ? '#19b47a' : '#888',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: 0
            }}
            onClick={() => { onLangChange('ko'); window.localStorage.setItem('aboutLang', 'ko'); }}
            aria-label="한국어로 보기"
          >
            KOR
          </button>
          <span style={{ color: '#bbb', fontWeight: 400 }}>|</span>
          <button
            className="lang-btn"
            style={{
              fontWeight: (window.location.pathname === '/about' && (window.localStorage.getItem('aboutLang') || 'ko') === 'en') ? 'bold' : 'normal',
              color: (window.location.pathname === '/about' && (window.localStorage.getItem('aboutLang') || 'ko') === 'en') ? '#19b47a' : '#888',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: 0
            }}
            onClick={() => { onLangChange('en'); window.localStorage.setItem('aboutLang', 'en'); }}
            aria-label="View in English"
          >
            ENG
          </button>
        </div>
      )}

      {/* 데스크톱 사용자 프로필 드롭다운 */}
      {!hideAuth && (
        <div className="auth-buttons desktop-only">
          {authState.token ? (
            <div className="user-profile" onClick={toggleDropdown} ref={dropdownRef}>
              <img src="/person.png" alt="User Avatar" className="user-avatar" />
              <span className="user-name">{displayedUserName}</span>
              {/* 드롭다운 메뉴 */}
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-item" onClick={() => handleMenuItemClick('/mypage')}>
                    마이페이지
                  </div>
                  <div className="dropdown-item" onClick={() => handleMenuItemClick('/settings')}>
                    설정
                  </div>
                  <div className="dropdown-item logout-dropdown-item" onClick={handleLogout}>
                    로그아웃
                  </div>
                </div>
              )}
            </div>
          ) : (
            <AccessibleLink
              onClick={() => handleMenuItemClick('/auth/login')}
              ariaLabel="로그인"
              className="auth-button login"
            >
              로그인
            </AccessibleLink>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;

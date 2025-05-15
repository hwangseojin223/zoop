// frontend/src/components/Navbar/Navbar.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 경로 확인 및 수정 필요
import './Navbar.css'; // CSS 파일 임포트 확인 및 경로 수정 필요

const Navbar = () => {
  const navigate = useNavigate();
  const { authState, setAuthState } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false); // 햄버거 토글 상태

  // 모바일 메뉴 외부 클릭 감지를 위한 Ref
  const navbarRef = useRef(null);

  // ✅ 모바일 메뉴 외부 클릭 감지 Effect (기존 코드)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target) && menuOpen) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);


  // ✅✅✅ 새로운 Effect: 화면 리사이즈 시 모바일 메뉴 자동 닫기 ✅✅✅
  useEffect(() => {
    // 화면 리사이즈 이벤트 핸들러 함수
    const handleResize = () => {
      // 윈도우 현재 너비가 768px보다 크고 (데스크탑 크기 이상)
      // 모바일 메뉴가 열려 있다면 (menuOpen === true)
      if (window.innerWidth > 768 && menuOpen) {
        setMenuOpen(false); // 모바일 메뉴 닫기
      }
    };

    // 윈도우에 'resize' 이벤트 리스너 추가
    window.addEventListener('resize', handleResize);

    // Effect 클린업 함수: 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [menuOpen]); // menuOpen 상태가 변경될 때마다 Effect를 다시 실행하여 handleResize 함수가 최신 menuOpen 값을 참조하도록 함

  // 로고 클릭 시 처리 함수 (기존 코드)
  const handleLogoClick = () => {
    setMenuOpen(false); // 로고 클릭 시 메뉴 닫기
    if (authState.token) {
      if (authState.userType === 'candidate') {
        navigate('/candidate/dashboard');
      } else if (authState.userType === 'company') {
        navigate('/company/dashboard');
      } else {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  // 로그아웃 처리 함수 (기존 코드)
  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    localStorage.removeItem('loginId');
    setAuthState({ token: null, userType: null, userId: null, loginId: null });
    navigate('/auth/login');
    setMenuOpen(false); // 로그아웃 후 메뉴 닫기
  };

  // 모바일 메뉴 내 링크 또는 버튼 클릭 시 처리 함수 (기존 코드)
  const handleMenuItemClick = (path = '#') => {
      console.log("메뉴 항목 클릭:", path);
      setMenuOpen(false); // 항목 클릭 시 메뉴 닫기
      if (path && path !== '#' && path !== 'javascript:void(0)') {
          navigate(path);
      }
  };

  // ✅✅✅ return 부분은 이전 코드와 동일합니다. ✅✅✅
  return (
    <header className="zoop-navbar" ref={navbarRef}>
      <img src="/logo_zoop.png" alt="zoop 로고" className="logo-img" onClick={handleLogoClick} />

      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"} aria-expanded={menuOpen}>
        ☰
      </button>

      <nav className="nav-links desktop-only">
        <a href="#" onClick={(e) => e.preventDefault()}>회사 소개</a>
        <a href="#" onClick={(e) => e.preventDefault()}>공지사항</a>
        <a href="#" onClick={(e) => e.preventDefault()}>고객센터</a>
        <a href="#" onClick={(e) => e.preventDefault()}>자주 묻는 질문</a>
        <a href="#" onClick={(e) => e.preventDefault()}>채용</a>
      </nav>

      <div className="auth-buttons desktop-only">
        {authState.token ? (
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
            <a href="#" onClick={() => handleMenuItemClick('#')}>회사 소개</a>
            <a href="#" onClick={() => handleMenuItemClick('#')}>공지사항</a>
            <a href="#" onClick={() => handleMenuItemClick('#')}>고객센터</a>
            <a href="#" onClick={() => handleMenuItemClick('#')}>자주 묻는 질문</a>
            <a href="#" onClick={() => handleMenuItemClick('#')}>채용</a>
          </nav>
          <div className="auth-buttons mobile-only">
            {authState.token ? (
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

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Index.css';
import { useAuth } from '../context/AuthContext'; // ✅ 로그인 상태 사용

export default function Index() {
  const navigate = useNavigate();
  const { authState, setAuthState } = useAuth(); // ✅ 로그인 정보 확인

  useEffect(() => {
    const handleScroll = () => {
      const subtitle = document.getElementById('subtitle-section');
      if (!subtitle) return;
      const top = subtitle.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      if (top < windowHeight - 100) {
        subtitle.classList.add('visible');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ 로그아웃 기능
  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    setAuthState({ token: null, userType: null, userId: null });
    navigate('/auth/login');
  };

  return (
    <div className="zoop-index-wrapper">
      {/* 상단 네비게이션 */}
      <header className="zoop-navbar">
        <img
          src="/logo_zoop.png"
          alt="logo"
          className="logo-img"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/')}
        />
        <nav className="nav-links">
          <a href="#">회사 소개</a>
          <a href="#">공지사항</a>
          <a href="#">고객센터</a>
          <a href="#">자주 묻는 질문</a>
          <a href="#">채용</a>
        </nav>

        {/* ✅ 로그인 여부에 따라 버튼 표시 변경 */}
        <div className="auth-buttons">
          {authState.token ? (
            <button className="btn-filled" onClick={handleLogout}>로그아웃</button>
          ) : (
            <>
              <button className="btn-outline" onClick={() => navigate('/auth/applicant/signup')}>회원가입</button>
              <button className="btn-filled" onClick={() => navigate('/auth/login')}>로그인</button>
            </>
          )}
        </div>
      </header>

      {/* 메인 배너 */}
      <section className="hero-section">
        <img src="/zoop_main_banner.png" alt="banner" className="hero-image" />
        <div className="hero-text">
          <h1>채용의 모든 것<br />ZOOP에서 쉽고 간편하게</h1>
          <button
            className="cta-button"
            onClick={() => navigate('/auth/applicant/signup')}
          >
            👉 3초만에 가입하고 인재 찾기
          </button>
        </div>
      </section>

      <section className="subtitle-section" id="subtitle-section">
        <div className="subtitle-content">
          <p>내 커리어를 한 번에 업데이트하고 한 곳에서 관리하세요.</p>
          <p>이제껏 경험 못 했던 쉽고 편리한 스카우트 서비스,</p>
          <p>줍과 함께라면 당신의 미래가 새로워질 거예요.</p>
        </div>
      </section>

      <footer className="footer-section">
        <div className="footer-grid">
          {/* Footer 내용 생략 */}
        </div>

        <div className="footer-bottom">
          <strong>(주)줍스튜디오</strong>
          <p>사업자 등록번호: 120-88-01280 │ 대표: 홍길동</p>
          <p>서울특별시 강남구 테헤란로 133, 9층 (역삼동, Zoop타워)</p>
          <div className="footer-terms">
            <p><strong>서비스 이용약관</strong></p>
            <p><strong>개인정보 처리방침</strong></p>
            <p><strong>위치기반서비스 이용약관</strong></p>
            <p><strong>전자금융거래약관</strong></p>
          </div>
          <div className="footer-icons">
            <span>📘</span> <span>🐦</span> <span>📸</span> <span>🔗</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

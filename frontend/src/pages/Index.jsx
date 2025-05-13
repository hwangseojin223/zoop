import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Index.css';

export default function Index() {
  const navigate = useNavigate();

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
        <div className="auth-buttons">
          <button className="btn-outline" onClick={() => navigate('/auth/applicant/signup')}>회원가입</button>
          <button className="btn-filled" onClick={() => navigate('/auth/login')}>로그인</button>
        </div>
      </header>

      {/* 메인 배너 */}
      <section className="hero-section">
        <img src="/zoop_main_banner.png" alt="banner" className="hero-image" />
        <div className="hero-text">
          <h1>채용의 모든 것<br />ZOOP에서 쉽고 간편하게</h1>
          <button
            className="cta-button"
            onClick={() => navigate('/auth/applicant/signup')} // ✅ 여기 수정됨
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
          <div>
            <strong>서비스</strong>
            <p>공지사항</p>
            <p>자주 묻는 질문</p>
            <p>공동인증서 관리</p>
            <p>계정 일시잠금</p>
            <p>고객센터</p>
            <p>개인(신용)정보 이용·제공 내역 조회</p>
            <p>브랜드 리소스센터</p>
            <p>줍의 개인정보 보호</p>
            <p>줍유스카드</p>
          </div>
          <div>
            <strong>회사</strong>
            <p>회사 소개</p>
            <p>줍페이먼츠</p>
            <p>줍인슈어런스</p>
            <p>줍증권</p>
            <p>줍세이프</p>
            <p>줍플레이스</p>
            <p>줍인컴</p>
            <p>채용</p>
            <p>기술 블로그</p>
            <p>블로그</p>
            <p>공고</p>
          </div>
          <div>
            <strong>문의</strong>
            <p>사업 제휴</p>
            <p>줍쇼핑 입점문의</p>
            <p>광고 문의</p>
            <p>인증 사업 문의</p>
            <p>마케팅 · PR</p>
            <p>IR</p>
          </div>
          <div>
            <strong>고객센터</strong>
            <p>전화: 1599-4905 (24시간 연중무휴)</p>
            <p>이메일(고객전용): support@zoop.im</p>
            <p>이메일(외부기관전용): safe@zoop.im</p>
            <p>민원 접수</p>
            <p>민원 접수(비즈니스 고객)</p>
          </div>
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

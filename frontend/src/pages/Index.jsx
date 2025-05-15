// frontend/src/pages/Index/Index.js // 파일 경로 확인
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Index.css'; // Index 페이지 자체의 스타일 (네비게이션 바 스타일 아님)
import { useAuth } from '../context/AuthContext'; // ✅ 로그인 상태 사용

// ✅ 햄버거 메뉴 기능이 포함된 Navbar 컴포넌트 임포트
import Navbar from '../components/Navbar'; // ✅ Navbar 컴포넌트 파일 경로 확인 및 수정 필요


export default function Index() {
  const navigate = useNavigate();
  const { authState, setAuthState } = useAuth(); // ✅ 로그인 정보 확인 (필요시)

  // 스크롤 이벤트 처리 로직 (기존 코드 유지)
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

  // 로그아웃 기능 (Navbar 컴포넌트에서 처리되므로 Index.js에서는 불필요할 수 있음)
  // 필요하다면 AuthContext의 logout 함수 등을 사용하여 중앙에서 관리
  const handleLogout = () => {
    // 이 로직은 Navbar 컴포넌트의 handleLogout 함수로 옮기는 것이 좋습니다.
    // Navbar 컴포넌트가 로그인 상태를 알고 직접 로그아웃 버튼을 렌더링하고 처리합니다.
    console.log("Index.js에서 로그아웃 호출됨 - Navbar 컴포넌트로 로직 이동 고려");
    // ... (로그아웃 처리 로직) ...
  };


  return (
    <div className="zoop-index-wrapper">
      {/* ✅ 상단 네비게이션: Navbar 컴포넌트를 호출하여 사용 */}
      {/* Navbar 컴포넌트가 햄버거 메뉴를 포함하여 전체 네비게이션 바를 렌더링합니다. */}
      <Navbar /> {/* ✅ Navbar 컴포넌트 사용 */}

      {/* 메인 배너 (기존 코드 유지) */}
      <section className="hero-section">
        <img src="/zoop_main_banner.png" alt="banner" className="hero-image" />
        <div className="hero-text">
          <h1>채용의 모든 것<br />ZOOP에서 쉽고 간편하게</h1>
          <button
            className="cta-button"
            onClick={() => navigate('/auth/applicant/signup')} // 실제 경로로 수정 필요
          >
            👉 3초만에 가입하고 인재 찾기
          </button>
        </div>
      </section>

      <section className="subtitle-section" id="subtitle-section"> {/* 서브타이틀 섹션 */}
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

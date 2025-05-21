import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import './About.css';

export default function About() {
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [showTextAfterPlane, setShowTextAfterPlane] = useState(false);

  // 스크롤 위치에 따라 visibleIndex 업데이트
  const handleScroll = () => {
    const sections = document.querySelectorAll('.scroll-slide');
    const scrollTop = window.scrollY + window.innerHeight * 0.6;


    sections.forEach((section, index) => {
      const offsetTop = section.offsetTop;
      const offsetBottom = offsetTop + section.offsetHeight;

      if (scrollTop >= offsetTop && scrollTop < offsetBottom) {
        setVisibleIndex(index);
      }
    });
  };

  // 스크롤 이벤트 등록
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 비행기 애니메이션이 끝난 후 텍스트 표시
  useEffect(() => {
    if (visibleIndex === 1) {
      setShowTextAfterPlane(false);
      const timer = setTimeout(() => {
        setShowTextAfterPlane(true);
      }, 1200); // 비행기 애니메이션 시간과 동일
      return () => clearTimeout(timer);
    } else {
      setShowTextAfterPlane(false);
    }
  }, [visibleIndex]);

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section
        className="hero-banner"
        style={{ backgroundImage: "url('/info/about_banner.jpg')" }}
      >
        <div className="overlay">
          <h1>채용, 그 이상의 자동화를 만듭니다</h1>
        </div>
      </section>

      {/* Scroll Section */}
      <section className="scroll-unlock-section">
        {/* 문장 1 */}
        <div className={`scroll-slide ${visibleIndex === 0 ? 'visible' : ''}`}>
          <h2 className="fade-text">기회는 기다리지 않습니다</h2>
        </div>

        {/* 문장 2 + 비행기 */}
        <div className={`scroll-slide ${visibleIndex === 1 ? 'visible' : ''}`}>
        {visibleIndex === 1 && (
          <div className="plane-text-wrapper">
            <svg
              className="paper-plane-svg"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="60"
              height="60"
              fill="white"
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
            <h2 className="plane-trail-text show">우리는 먼저 연결하고, 먼저 제안하고, 먼저 만납니다.</h2>
          </div>
        )}
        </div>

        {/* 문장 3 */}
        <div className={`scroll-slide last ${visibleIndex === 2 ? 'visible' : ''}`}>
          <h2 className="fade-text">ZOOP은 새로운 채용의 물결을 이끕니다.</h2>
        </div>
      </section>

      {/* Stats Section */}
      <section
        className="about-stats-banner"
        style={{ backgroundImage: "url('/info/about2.jpg')" }}
      >
        <div className="stats-gradient"></div>
        <div className="stats-overlay show">
          <div className="stats-text-block">
            <h3>채용 1건당 약 350만원 절감</h3>
            <h3>불필요한 인사/홍보비용 연 1,200억 감축 기대</h3>
          </div>
        </div>
      </section>

      {/* 기타 섹션들 */}
      <section
        className="about-mission-section"
        style={{ backgroundImage: "url('/info/mission_background.jpg')" }}
      >
        <div className="mission-card">
          <h4>Team Mission</h4>
          <p>
            ZOOP은 바꾸고 싶은 세상의 모습이 있고 생각만 해도 가슴 뛰는 목표가 있는 조직입니다.<br />
            어렵고, 불편하고, 멀게 느껴지는 채용이 아닌 누구에게나 쉽고 상식적인 채용 환경을 만드는 것이 우리의 존재 이유입니다.
          </p>
        </div>
      </section>

      <section className="about-vision-section">
        <h2>ZOOP이 바꿀 채용</h2>
        <p>모두를 위한, 새로운 채용의 기준을 만들어 갑니다</p>
        <div className="vision-cards">
          <div className="vision-card">
            <span>ZOOP 스코어</span>
            <h3>상식적인 채용 평가는 모두를 위한 기회를 만듭니다</h3>
          </div>
          <div className="vision-card">
            <span>ZOOP AI 인터뷰</span>
            <h3>정량화된 기술 분석과 공정한 AI면접이 가능합니다</h3>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="about-footer">
        <div className="footer-columns">
          <div>
            <h4>서비스</h4>
            <ul><li>공지사항</li><li>자주 묻는 질문</li><li>고객센터</li></ul>
          </div>
          <div>
            <h4>회사</h4>
            <ul><li>회사 소개</li><li>채용</li><li>블로그</li></ul>
          </div>
          <div>
            <h4>문의</h4>
            <ul><li>제휴 문의</li><li>IR 문의</li><li>홍보 문의</li></ul>
          </div>
        </div>
        <div className="footer-legal">
          <small>© ZOOP Corp. All rights reserved.</small>
        </div>
      </footer>
    </>
  );
}

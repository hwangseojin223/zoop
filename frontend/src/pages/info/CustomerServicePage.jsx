import React from 'react';
import './CustomerServicePage.css';

const navLinks = [
  { label: '고객센터', href: '/support', active: true },
  { label: '자주 묻는 질문', href: '/faq' },
  { label: '채용 공고', href: '/recruit' },
];

const categories = [
  '회원가입/로그인',
  '이력서 작성',
  '채용 공고 지원',
  '면접 일정/결과',
  '포인트/마일리지',
  '기업회원 문의',
];

function CustomerServicePage() {
  return (
    <div className="customer-main-bg">
      <nav className="customer-nav">
        <div className="customer-nav-logo">고객센터</div>
        <ul className="customer-nav-links">
          {navLinks.map(link => (
            <li key={link.label} className={link.active ? 'active' : ''}>
              <a href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
            </li>
          ))}
        </ul>
      </nav>
      <main className="customer-main-content">
        <div className="customer-hero">
          <img src="https://static.toss.im/illusts/support/character-support.png" alt="고객센터 캐릭터" className="customer-hero-img" />
          <h1 className="customer-hero-title">무엇을 도와드릴까요?</h1>
          <div className="customer-search-box">
            <input type="text" placeholder="궁금한 점을 검색해보세요." />
          </div>
          <div className="customer-categories">
            {categories.map(cat => (
              <button key={cat} className="customer-category-btn">{cat}</button>
            ))}
          </div>
        </div>
        <div className="customer-info-section">
          <div className="customer-info-left">
            <h2>ZOOP 고객센터에서<br />24시간 상담받을 수 있어요</h2>
            <div className="customer-info-contacts">
              <div>회원/로그인 문의 <b>1661-7654</b></div>
              <div>이력서/포트폴리오 문의 <b>1599-4905</b></div>
              <div>채용/면접 문의 <b>1599-7987</b></div>
              <div>기업회원 문의 <b>1660-1114</b></div>
            </div>
          </div>
          <div className="customer-info-right">
            <img src="https://static.toss.im/illusts/support/phone-support.png" alt="상담전화" className="customer-info-img" />
          </div>
        </div>
      </main>
    </div>
  );
}

export default CustomerServicePage; 
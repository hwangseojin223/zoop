import React, { useState } from 'react';
import './FaqPage.css';

const navLinks = [
  { label: '고객센터', href: '/customer' },
  { label: '자주 묻는 질문', href: '/faq', active: true },
  { label: '채용 공고', href: '/recruit' },
];

const faqData = [
  { category: '회원가입/로그인', question: '회원가입은 어떻게 하나요?(개인/기업별 안내)', answer: "홈페이지 우측 상단의 '회원가입' 버튼을 클릭 후, 이메일 또는 소셜 계정으로 가입할 수 있습니다." },
  { category: '회원가입/로그인', question: '비밀번호를 잊어버렸어요.', answer: "로그인 페이지에서 '비밀번호 찾기'를 클릭하면, 이메일을 통해 재설정할 수 있습니다." },
  { category: '서비스 이용', question: '[개인회원] 프로필/이력서는 어떻게 작성하나요?', answer: '고객센터에 문의해 주세요. 오류 화면을 캡처하면 더 빠른 처리가 가능합니다.' },
  { category: '서비스 이용', question: '[개인회원] 구인 공고는 어떻게 확인하고 지원하나요?', answer: '고객센터에 문의해 주세요. 오류 화면을 캡처하면 더 빠른 처리가 가능합니다.' },
  { category: '서비스 이용', question: '[기업회원] 채용 공고는 어떻게 등록하나요?', answer: '고객센터에 문의해 주세요. 오류 화면을 캡처하면 더 빠른 처리가 가능합니다.' },
  { category: '서비스 이용', question: '[기업회원] 후보자 정보는 어떻게 검색하고 열람하나요?', answer: '고객센터에 문의해 주세요. 오류 화면을 캡처하면 더 빠른 처리가 가능합니다.' },
  { category: '서비스 이용', question: '서비스 이용 중 오류가 발생했어요.', answer: '고객센터에 문의해 주세요. 오류 화면을 캡처하면 더 빠른 처리가 가능합니다.' },
  { category: '기술관련', question: '어떤 브라우저를 지원하나요?', answer: '앱이나 웹사이트 오류 발생 시, 고객센터에 문의해 주세요. 오류 화면을 캡처하면 더 빠른 처리가 가능합니다.' },
  { category: '기술관련', question: '모바일 환경에서 이용 가능한가요?', answer: '앱이나 웹사이트 오류 발생 시, 고객센터에 문의해 주세요. 오류 화면을 캡처하면 더 빠른 처리가 가능합니다.' },
  { category: '기술관련', question: '사이트 속도가 느려요.', answer: '앱이나 웹사이트 오류 발생 시, 고객센터에 문의해 주세요. 오류 화면을 캡처하면 더 빠른 처리가 가능합니다.' }
];

// 사이드바 카테고리 목록
const categories = [
  '회원가입/로그인',
  '서비스 이용',
  '기술관련',
  '기타',
  '1:1문의/문의하기',
  '이용약관 및 개인정보처리방침',
  '사용가이드/매뉴얼',
  '연락처 정보'
];

function FaqPage() {
  const [openIdx, setOpenIdx] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('회원가입/로그인');

  // 선택된 카테고리의 FAQ만 필터링
  const filteredFaqData = faqData.filter(faq => faq.category === selectedCategory);

  return (
    <div className="customer-main-bg">
      <nav className="customer-nav">
        <div className="customer-nav-logo">고객센터</div>
        <ul className="customer-nav-links">
          {navLinks.map(link => (
            <li key={link.label} className={link.active ? 'active' : ''}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="faq-container">
        {/* 사이드바 */}
        <aside className="faq-sidebar">
          <h3 className="sidebar-title">카테고리</h3>
          <ul className="category-list">
            {categories.map(category => (
              <li key={category}>
                <button 
                  className={`category-item ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="faq-main-content">
          <h1 className="faq-title">{selectedCategory}</h1>
          {filteredFaqData.length > 0 ? (
            <ul className="faq-list">
              {filteredFaqData.map((item, idx) => (
                <li key={`${item.category}-${idx}`} className={`faq-item${openIdx === idx ? ' open' : ''}`}> 
                  <button className="faq-question" onClick={() => setOpenIdx(openIdx === idx ? null : idx)} aria-expanded={openIdx === idx}>
                    <span>{item.question}</span>
                    <span className={`faq-arrow${openIdx === idx ? ' open' : ''}`}
                      aria-hidden="true"
                      style={{display: 'flex', alignItems: 'center'}}>
                      <svg width="22" height="22" viewBox="0 0 24 24" style={{transform: openIdx === idx ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.35s'}}>
                        <path d="M7 10l5 5 5-5" stroke={openIdx === idx ? '#22c55e' : '#888'} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </button>
                  <div className={`faq-answer${openIdx === idx ? ' open' : ''}`}>{item.answer}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-faq-message">
              <p>해당 카테고리의 FAQ가 없습니다.</p>
              <p>다른 카테고리를 선택해 주세요.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default FaqPage; 
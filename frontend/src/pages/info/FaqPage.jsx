import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import SEO from '../../components/SEO';
import './FaqPage.css';
import { useLocation } from 'react-router-dom';

const navLinks = [
  { label: '자주 묻는 질문', href: '/faq', active: true },
  { label: '피해사건 신고', href: '/report' },
  { label: 'HOME', href: '/' },
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
  const location = useLocation();
  const [openIdx, setOpenIdx] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('회원가입/로그인');

  // 쿼리 파라미터로 카테고리 선택
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    if (cat && categories.includes(cat)) {
      setSelectedCategory(cat);
    } else {
      setSelectedCategory('회원가입/로그인');
    }
  }, [location.search]);

  // 선택된 카테고리의 FAQ만 필터링
  const filteredFaqData = faqData.filter(faq => faq.category === selectedCategory);

  return (
    <>
      {/* SEO 컴포넌트 */}
      <SEO
        title="자주 묻는 질문 - ZOOP | FAQ"
        description="ZOOP 서비스 이용에 대한 자주 묻는 질문과 답변을 확인하세요. AI 채용, GitHub 분석, 면접 프로세스 등에 대한 상세한 정보를 제공합니다."
        keywords="ZOOP FAQ, 자주묻는질문, AI채용질문, GitHub분석질문, AI면접질문, 채용플랫폼질문, IT채용질문"
        image="/faq-banner.jpg"
        url="https://zoop.com/faq"
        type="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqData.map((faq, index) => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        }}
      />

      <Navbar />
      
      <div className="customer-main-bg">
        <nav className="customer-nav">
          <div className="customer-nav-logo" style={{cursor: 'pointer'}} onClick={() => window.location.href = '/support'}>고객센터</div>
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
                    <button className="faq-question center" onClick={() => setOpenIdx(openIdx === idx ? null : idx)} aria-expanded={openIdx === idx}>
                      <span className="faq-q-icon" aria-hidden="true" style={{marginRight: 12, color: '#22c55e', fontWeight: 700, fontSize: '1.3rem', display: 'flex', alignItems: 'center'}}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{marginRight: 4}}><circle cx="12" cy="12" r="11" stroke="#22c55e" strokeWidth="2" fill="#f6fff3"/><text x="8" y="17" fontSize="12" fontWeight="bold" fill="#22c55e">Q</text></svg>
                      </span>
                      <span>{item.question}</span>
                      <span className={`faq-arrow${openIdx === idx ? ' open' : ''}`}
                        aria-hidden="true"
                        style={{display: 'flex', alignItems: 'center'}}>
                        <svg width="22" height="22" viewBox="0 0 24 24" style={{transform: openIdx === idx ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.35s'}}>
                          <path d="M7 10l5 5 5-5" stroke={openIdx === idx ? '#22c55e' : '#888'} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </button>
                    <div className={`faq-answer${openIdx === idx ? ' open' : ''}`}> 
                      <span className="faq-a-icon" aria-hidden="true" style={{marginRight: 10, color: '#a3e635', fontWeight: 700, fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', verticalAlign: 'top'}}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{marginRight: 3}}><circle cx="12" cy="12" r="9" stroke="#a3e635" strokeWidth="2" fill="#f6fff3"/><text x="7" y="16" fontSize="10" fontWeight="bold" fill="#a3e635">A</text></svg>
                      </span>
                      {item.answer}
                    </div>
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
    </>
  );
}

export default FaqPage; 
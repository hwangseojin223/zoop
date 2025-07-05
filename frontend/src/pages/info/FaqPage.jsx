import React, { useState, useEffect } from 'react';
import './CustomerServicePage.css'; // 헤더 스타일 사용
import './FaqButton.css';
import FaqButton from './FaqButton';
import { Link, useLocation } from 'react-router-dom';

const FaqPage = () => {
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('회원가입/로그인');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const hash = location.hash;
    if (hash === '#service-usage') setSelectedCategory('서비스 이용');
    if (hash === '#signup-login') setSelectedCategory('회원가입/로그인');
  }, [location]);

  // FAQ 데이터 배열
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

  const toggleSection = idx => setActiveIndex(activeIndex === idx ? null : idx);
  const filteredFaqs = faqData.filter(faq => faq.category === selectedCategory);

  return (
    <div className="customer-service-page">
      <header className="top-nav">
        <Link to="/customer-service" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>고객센터</Link>
        {/* 햄버거 버튼 - 모바일에서만 보임 */}
        <button
          className="hamburger mobile-only"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={menuOpen}
        >
          ☰
        </button>

        {/* 데스크탑 메뉴 - 데스크탑에서만 보임 */}
        <nav className="nav-list desktop-only">
          <ul>
            <li><FaqButton /></li>
            <li><Link to="/report">피해사건신고</Link></li>
            <li><Link to="/notice">이벤트</Link></li>
          </ul>
        </nav>

        {/* 모바일 햄버거 메뉴 - 모바일에서만 보임 */}
        {menuOpen && (
          <div className="hamburger-menu mobile-only">
            <ul>
              <li>
                <FaqButton onClick={() => setMenuOpen(false)} />
              </li>
              <li>
                <Link to="/report" onClick={() => setMenuOpen(false)}>피해사건신고</Link>
              </li>
              <li>
                <Link to="/notice" onClick={() => setMenuOpen(false)}>공지/이벤트</Link>
              </li>
            </ul>
          </div>
        )}
      </header>

      <div className="faq-layout" style={{ paddingTop: '80px', display: 'flex', alignItems: 'flex-start' }}>
        {/* 사이드바: 본문 왼쪽 */}
        <aside className="sidebar" style={{ width: '220px', marginRight: '30px', background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', position: 'sticky', top: '100px', height: 'fit-content' }}>
          <ul className="sidebar-menu">
            {categories.map((category, i) => (
              <li key={i} className={selectedCategory === category ? 'active' : ''} onClick={() => { setSelectedCategory(category); setActiveIndex(null); }}>
                {category}
              </li>
            ))}
          </ul>
        </aside>
        {/* FAQ 본문: 가운데 정렬 */}
        <main className="faq-page-container" style={{ flex: 1, maxWidth: '800px', background: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', margin: '40px 0' }}>
          <h1>{selectedCategory} 관련 자주 묻는 질문</h1>
          {filteredFaqs.map((item, idx) => (
            <section className="faq-section" key={idx}>
              <h2 className={`section-title ${activeIndex === idx ? 'open' : ''}`} onClick={() => toggleSection(idx)}>
                {item.question} <span className="toggle-icon">▼</span>
              </h2>
              <div className={`section-content ${activeIndex === idx ? 'active' : ''}`}>
                <p>{item.answer}</p>
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
};

export default FaqPage;

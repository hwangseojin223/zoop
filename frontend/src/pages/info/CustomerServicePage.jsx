import React, { useState } from 'react';
import './CustomerServicePage.css';
import { useNavigate, useLocation } from 'react-router-dom';

const navLinks = [
  { label: '고객센터', href: '/support', active: true },
  { label: '자주 묻는 질문', href: '/faq' },
  { label: '피해사건 신고', href: '/report' },
  { label: 'HOME', href: '/' },
];

const categories = [
  '회원가입/로그인',
  '이력서 작성',
  '채용 공고 지원',
  '면접 일정/결과',
  '포인트/마일리지',
  '기업회원 문의',
];

// OpenAI API 호출 함수
async function fetchOpenAIAssistant(question) {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  const endpoint = 'https://api.openai.com/v1/chat/completions';
  const body = {
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: '당신은 친절한 고객센터 AI 상담원입니다.' },
      { role: 'user', content: question }
    ],
    max_tokens: 512,
    temperature: 0.2
  };
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('AI 답변 요청 실패');
  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'AI 답변을 불러오지 못했습니다.';
}

// 상담원 이모티콘 이미지
function SupportMascot({ size = 80 }) {
  return (
    <img 
      src="/zoopy.png" 
      alt="ZOOP 마스코트" 
      width={size} 
      height={size} 
      className="customer-hero-img"
      style={{ 
        borderRadius: '50%',
        animation: 'bounce 2s ease-in-out infinite'
      }}
    />
  );
}

function CustomerServicePage() {
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  function handleSearch() {
    navigate('/faq');
  }

  return (
    <div className="customer-main-bg">
      <nav className="customer-nav">
        <div className="customer-nav-logo" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/support'}>고객센터</div>
        <ul className="customer-nav-links">
          {navLinks.filter(link => !(location.pathname === '/support' && link.href === '/support')).map(link => (
            <li key={link.label} className={link.active ? 'active' : ''}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </nav>
      <main className="customer-main-content">
        <div className="customer-hero">
          <SupportMascot size={80} />
          <h1 className="customer-hero-title">무엇을 도와드릴까요?</h1>
          <div className="customer-search-box" style={{ display: 'flex', gap: 8 }}>
            <div className="MuiInputBase-root MuiInput-root MuiInput-underline MuiInputBase-colorPrimary css-oqtenp" style={{ flex: 1, borderBottom: '2px solid #30C59B', display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 6, padding: '2px 12px' }}>
              <input
                placeholder="궁금한 내용의 키워드를 입력해 주세요"
                type="text"
                className="MuiInputBase-input MuiInput-input css-mevgbx"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1.08rem', background: 'transparent', padding: '8px 0' }}
              />
            </div>
            <button
              className="search-btn"
              style={{ background: '#30C59B', color: '#fff', border: 'none', borderRadius: 8, padding: '0 18px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', minWidth: 90 }}
              disabled={!searchInput.trim()}
              onClick={handleSearch}
            >
              검색
            </button>
          </div>
          <div className="customer-categories">
            {categories.map(cat => {
              const handleClick = () => navigate('/faq');
              return (
                <button
                  key={cat}
                  className="customer-category-btn"
                  onClick={handleClick}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </main>
      <div className="customer-info-section">
        <div className="customer-info-left">
          <h2>ZOOP 고객센터에서<br />24시간 상담받을 수 있어요</h2>
          <div className="customer-info-contacts">
            <div>회원/로그인 문의 <b style={{color: '#22c55e'}}>1661-7654</b></div>
            <div>이력서/포트폴리오 문의 <b style={{color: '#22c55e'}}>1599-4905</b></div>
            <div>채용/면접 문의 <b style={{color: '#22c55e'}}>1599-7987</b></div>
            <div>기업회원 문의 <b style={{color: '#22c55e'}}>1660-1114</b></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerServicePage; 
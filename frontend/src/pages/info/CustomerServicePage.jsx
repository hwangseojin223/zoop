import React, { useState } from 'react';
import './CustomerServicePage.css';
import './FaqButton.css';
import FaqButton from './FaqButton';
import { Link } from 'react-router-dom';

const CustomerServicePage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // FAQ 데이터베이스
  const faqDatabase = {
    // 회원가입/로그인 관련
    '회원가입': '홈페이지 우측 상단의 \'회원가입\' 버튼을 클릭 후, 이메일 또는 소셜 계정으로 가입할 수 있습니다.',
    '로그인': '홈페이지 우측 상단의 \'로그인\' 버튼을 클릭하여 이메일 또는 소셜 계정으로 로그인할 수 있습니다.',
    '비밀번호': '로그인 페이지에서 \'비밀번호 찾기\'를 클릭하면, 이메일을 통해 재설정할 수 있습니다.',
    '탈퇴': '마이페이지 > 설정 > 회원탈퇴에서 계정을 삭제할 수 있습니다.',
    
    // 서비스 이용 관련
    '프로필': '마이페이지에서 프로필 편집 버튼을 클릭하여 개인정보, 경력사항, 자기소개 등을 작성할 수 있습니다.',
    '채용공고': '기업회원으로 로그인 후, 대시보드에서 \'채용공고 등록\' 버튼을 클릭하여 공고를 작성할 수 있습니다.',
    '지원': '원하는 채용공고를 찾아 \'지원하기\' 버튼을 클릭하면 지원이 완료됩니다.',
    '검색': '홈페이지 메인에서 키워드, 지역, 직무 분야, 경력 등을 선택하여 원하는 채용공고를 찾을 수 있습니다.',
    
    // 기술 관련
    '기술': 'zoop는 IT 분야 전용 채용 플랫폼으로, 개발자, 디자이너, 기획자, 마케터 등 다양한 IT 직무의 채용공고를 제공합니다.',
    '포트폴리오': '마이페이지의 프로필 편집에서 GitHub 링크, 프로젝트 설명, 사용 기술 등을 등록할 수 있습니다.',
    
    // 이용약관 및 개인정보처리방침
    '이용약관': '홈페이지 하단의 \'이용약관\' 링크에서 확인하실 수 있습니다.',
    '개인정보': '홈페이지 하단의 \'개인정보처리방침\' 링크에서 확인하실 수 있습니다.',
    
    // 사용가이드/매뉴얼
    '앱': 'zoop는 웹 기반 서비스로 제공되며, 모바일에서도 브라우저를 통해 모든 기능을 이용하실 수 있습니다.',
    
    // 연락처 정보
    '문의': '고객센터 페이지에서 24시간 상담이 가능하며, 전화번호는 1661-7654입니다.',
    '연락처': 'zoop 고객센터: 1661-7654 (24시간 상담 가능), 기타 문의: 1599-4905',
    '1:1': '고객센터 페이지에서 \'1:1 문의하기\' 버튼을 클릭하여 작성하실 수 있습니다.',
    
    // 기타
    '오류': '서비스 이용 중 오류가 발생한 경우, 브라우저를 새로고침하거나 고객센터로 연락주세요.',
    '결제': 'zoop는 기본 서비스는 무료로 제공됩니다. 프리미엄 서비스는 유료입니다.',
    '보안': 'zoop는 최신 보안 기술을 적용하여 사용자의 개인정보를 안전하게 보호합니다.',
    
    // 공지사항 관련
    '공지사항': '홈페이지 상단의 \'공지사항\' 메뉴에서 서비스 업데이트, 정책 변경, 이벤트 정보 등을 확인할 수 있습니다.',
    '이벤트': '홈페이지의 \'이벤트\' 섹션에서 신규 회원 혜택, 추천인 이벤트, 기업 특별 프로모션 등을 확인할 수 있습니다.',
    '업데이트': 'zoop는 지속적으로 서비스를 개선하고 있으며, 최신 업데이트 내용은 공지사항에서 확인할 수 있습니다.',
    '점검': '정기 서버 점검은 매주 화요일 새벽 2시~4시에 진행되며, 사전에 공지사항을 통해 안내드립니다.',
    '정책': '서비스 정책 변경사항은 공지사항을 통해 사전에 안내드립니다.',
    '신규': 'zoop의 새로운 기능과 서비스는 공지사항과 이벤트 페이지에서 확인할 수 있습니다.',
  
  };

  // FAQ 검색 함수
  const findFAQAnswer = (query) => {
    const lowerQuery = query.toLowerCase();
    for (const [keyword, answer] of Object.entries(faqDatabase)) {
      if (lowerQuery.includes(keyword.toLowerCase())) {
        return answer;
      }
    }
    return null;
  };

  // AI 검색 기능
  const handleAISearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setAiAnswer('');
    
    // FAQ 데이터베이스에서 답변 찾기
    const faqAnswer = findFAQAnswer(searchQuery);
    if (faqAnswer) {
      setAiAnswer(faqAnswer);
      setIsLoading(false);
      return;
    }
    
    try {
      // 백엔드 AI API 호출
      const response = await fetch('http://localhost:8081/api/ai-search', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ question: searchQuery })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setAiAnswer(data.answer);
    } catch (error) {
      console.error('AI 검색 오류:', error);
      setAiAnswer('죄송합니다. AI 답변을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

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

      <main className="main-content">
        <div className="hero-section">
          <h1>👀</h1>
          <h2>무엇을 도와드릴까요? AI가 궁금한 점을 답변해드립니다</h2> 
          </div>
        <div style={{ marginTop: '10px' }}></div>

        <div className="search-section mt-4">
          <div className="search-bar-container">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAISearch(); }}
              placeholder="🔍궁금한 점을 검색해보세요."
              className="search-input"
            />
            <button onClick={handleAISearch} className="search-button">
              {isLoading ? '검색 중...' : 'AI 검색'}
            </button>
          </div>

          {/* 로딩 상태 표시 */}
          {isLoading && (
            <div className="ai-answer-container">
              <h3>🤖 AI가 답변을 생성하고 있습니다...</h3>
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>잠시만 기다려주세요</p>
              </div>
            </div>
          )}

          {/* AI 답변 표시 */}
          {aiAnswer && !isLoading && (
            <div className="ai-answer-container">
              <h3>🤖 AI 답변</h3>
              <p>{aiAnswer}</p>
            </div>
          )}

          <div className="suggestion-tags">
            {/* 회원가입/로그인 관련 */}
            <button 
              className="tag-button" 
              onClick={() => setSearchQuery('회원가입은 어떻게 하나요?')}
            >
              회원가입 방법
            </button>
            <button 
              className="tag-button" 
              onClick={() => setSearchQuery('비밀번호를 잊어버렸어요')}
            >
              비밀번호 찾기
            </button>
            <button 
              className="tag-button" 
              onClick={() => setSearchQuery('로그인이 안 돼요')}
            >
              로그인 문제
            </button>
            
            {/* 서비스 이용 관련 */}
            <button 
              className="tag-button" 
              onClick={() => setSearchQuery('프로필은 어떻게 작성하나요?')}
            >
              프로필 작성법
            </button>
            <button 
              className="tag-button" 
              onClick={() => setSearchQuery('채용공고는 어떻게 등록하나요?')}
            >
              채용공고 등록
            </button>
            <button 
              className="tag-button" 
              onClick={() => setSearchQuery('채용 검색은 어떻게 하나요?')}
            >
              채용 검색 방법
            </button>
            
            {/* 기술 관련 */}
            <button 
              className="tag-button" 
              onClick={() => setSearchQuery('포트폴리오 등록')}
            >
              포트폴리오 등록
            </button>
            <button 
              className="tag-button" 
              onClick={() => setSearchQuery('기술 스택 등록')}
            >
              기술 스택 등록
            </button>
            
            {/* 연락처 및 문의 */}
            <button 
              className="tag-button" 
              onClick={() => setSearchQuery('1:1 문의하기')}
            >
              1:1 문의하기
            </button>
            <button 
              className="tag-button" 
              onClick={() => setSearchQuery('고객센터 연락처')}
            >
              고객센터 연락처
            </button>
            
            {/* 이용약관 및 개인정보 */}
            <button 
              className="tag-button" 
              onClick={() => setSearchQuery('이용약관 확인')}
            >
              이용약관
            </button>
            <button 
              className="tag-button" 
              onClick={() => setSearchQuery('개인정보처리방침')}
            >
              개인정보처리방침
            </button>
            
            {/* 공지사항 관련 */}
            <button 
              className="tag-button" 
              onClick={() => setSearchQuery('공지사항 확인')}
            >
              공지사항
            </button>
            <button 
              className="tag-button" 
              onClick={() => setSearchQuery('이벤트 정보')}
            >
              이벤트 정보
            </button>
            <button 
              className="tag-button" 
              onClick={() => setSearchQuery('서비스 업데이트')}
            >
              서비스 업데이트
            </button>
            <button 
              className="tag-button" 
              onClick={() => setSearchQuery('정기점검 시간')}
            >
              정기점검 시간
            </button>
          </div>
        </div>
      </main>

      <section
        className="contact-section"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '40px 20px',
          backgroundColor: '#f0f9f8',
        }}
      >
        <div className="contact-info">
          <h2>
            <span style={{ marginLeft: '8px' }}>
              zoop 고객센터에서 24시간 상담받을 수 있어요
            </span>
            <span role="img" aria-label="전화하는 손" className="emoji">
              🤳
            </span>
          </h2>
          <div className="contact-info-grid">
            <div className="contact-item">
              <p>zoop 관련 문의</p>
              <p className="phone-number">1661-7654</p>
            </div>
            <div className="contact-item">
              <p>기타 다른 문의</p>
              <p className="phone-number">1599-4905</p>
            </div>
          </div>
        </div>
        <div className="contact-graphic">{/* 이미지/그래픽 가능 */}</div>
      </section>
    </div>
  );
};

export default CustomerServicePage;

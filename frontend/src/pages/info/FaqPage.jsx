import React, { useState } from 'react';
import './FaqPage.css';

const navLinks = [
  { label: '고객센터', href: '/customer' },
  { label: '자주 묻는 질문', href: '/faq', active: true },
  { label: '채용 공고', href: '/recruit' },
];

const faqList = [
  {
    q: '회원가입 인증 메일이 오지 않아요.',
    a: '스팸함을 확인하거나, 메일 주소를 다시 한 번 확인해 주세요. 그래도 받지 못했다면 고객센터로 문의해 주세요.'
  },
  {
    q: '이력서 파일은 어떤 형식으로 제출해야 하나요?',
    a: 'PDF, DOCX, HWP 등 주요 문서 형식을 지원합니다. 파일 용량은 10MB 이내로 제출해 주세요.'
  },
  {
    q: '채용 공고에 지원했는데 결과는 어디서 확인하나요?',
    a: '마이페이지 > 지원내역에서 지원 현황과 결과를 확인할 수 있습니다.'
  },
  {
    q: '면접 일정은 어떻게 조율하나요?',
    a: '면접 일정은 지원 후 안내되는 링크에서 직접 선택하거나, 담당자와 협의할 수 있습니다.'
  },
  {
    q: '포인트/마일리지는 어떻게 적립되나요?',
    a: '이력서 제출, 면접 참여 등 다양한 활동을 통해 포인트/마일리지가 자동 적립됩니다.'
  },
  {
    q: '기업회원 전환은 어떻게 하나요?',
    a: '마이페이지 > 회원정보에서 기업회원 전환 신청이 가능합니다. 추가 서류가 필요할 수 있습니다.'
  },
];

function FaqPage() {
  const [openIdx, setOpenIdx] = useState(null);
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
      <main className="faq-main-content">
        <h1 className="faq-title">자주 묻는 질문</h1>
        <ul className="faq-list">
          {faqList.map((item, idx) => (
            <li key={item.q} className={`faq-item${openIdx === idx ? ' open' : ''}`}> 
              <button className="faq-question" onClick={() => setOpenIdx(openIdx === idx ? null : idx)}>
                <span>{item.q}</span>
                <span className={`faq-arrow${openIdx === idx ? ' open' : ''}`}>▼</span>
              </button>
              {openIdx === idx && <div className="faq-answer">{item.a}</div>}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export default FaqPage; 
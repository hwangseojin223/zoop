import React, { useState } from 'react';
import './Notice.css';
import Navbar from '../../components/Navbar';
import SEO from '../../components/SEO';
import { Navigate } from 'react-router-dom';

const noticeList = [
  {
    id: 1,
    title: '서비스 점검 안내',
    date: '2025-07-01',
    summary: '7월 10일(수) 00:00~02:00까지 서비스 점검이 예정되어 있습니다.',
    detail: (
      <ul style={{ textAlign: "left", marginTop: 10, marginBottom: 0 }}>
        <li>서비스 점검 시간: 2024년 7월 10일(수) 00:00~02:00</li>
        <li>점검 중 일부 기능이 제한될 수 있습니다.</li>
        <li>더 나은 서비스 제공을 위한 점검이니 양해 부탁드립니다.</li>
      </ul>
    ),
  },
  {
    id: 2,
    title: '신규 기능 오픈 안내',
    date: '2025-07-05',
    summary: '구직자 맞춤 알림 기능이 추가되었습니다. 많은 이용 바랍니다.',
    detail: (
      <ul style={{ textAlign: "left", marginTop: 10, marginBottom: 0 }}>
        <li>구직자 맞춤 알림: 희망 조건 등록 시 채용공고 알림을 받을 수 있습니다.</li>
        <li>설정 방법: 내 정보 &gt; 알림 설정에서 원하는 조건을 추가하세요.</li>
        <li>추가 문의는 고객센터로 연락해 주세요.</li>
      </ul>
    )
  },
  {
    id: 3,
    title: '챗봇 기능 안내',
    date: '2025-07-10',
    summary: '챗봇 기능이 업데이트 되었습니다. 많은 이용 바랍니다.',
    detail: (
      <ul style={{ textAlign: "left", marginTop: 10, marginBottom: 0 }}>
        <li>상담 챗봇: 24시간 빠른 상담이 가능합니다.</li>
        <li>주요 기능: 자주 묻는 질문 안내, 1:1 문의 접수, 실시간 답변 제공</li>
        <li>고객센터 메뉴에서 챗봇을 이용해 보세요.</li>
      </ul>
    )
  },
  {
    id: 4,
    title: '[ZOOP] 고객센터 채팅상담 서비스 일시중단 안내',
    date: '2025-07-15',
    summary: '고객센터 채팅상담 서비스가 일시적으로 중단됩니다.',
    detail: (
      <ul style={{ textAlign: "left", marginTop: 10, marginBottom: 0 }}>
        <li>중단 일정: 2025년 7월 22일(월) 02:00~03:00</li>
        <li>사유: 시스템 안정화 작업</li>
        <li>작업 시간 동안 채팅 상담이 일시적으로 중단됩니다.</li>
        <li>불편을 드려 죄송합니다.</li>
      </ul>
    )
  }
];

// 공지 NEW 뱃지 기준(7일 이내)
function isNew(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = (now - date) / (1000 * 60 * 60 * 24);
  return diff <= 7;
}

// 공지 아이콘 SVG
function NoticeIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginBottom: 8}}>
      <path d="M24 14v10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <circle cx="24" cy="32" r="2" fill="#fff" />
    </svg>
  );
}

function Notice() {
  const [selectedId, setSelectedId] = useState(null);
  const toggleNotice = (id) => setSelectedId(selectedId === id ? null : id);

  return (
    <>
      <SEO
        title="공지사항 - ZOOP | 최신 소식 및 업데이트"
        description="ZOOP의 최신 공지사항과 업데이트 소식을 확인하세요. 서비스 개선, 새로운 기능, 이벤트 등 다양한 소식을 제공합니다."
        keywords="ZOOP 공지사항, 업데이트, 서비스소식, 새로운기능, 이벤트, AI채용소식"
        image="/notice-banner.jpg"
        url="https://zoop.com/notice"
        type="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "ZOOP 공지사항",
          "description": "ZOOP의 최신 공지사항과 업데이트",
          "numberOfItems": noticeList.length,
          "itemListElement": noticeList.map((notice, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "Article",
              "headline": notice.title,
              "datePublished": notice.date,
              "description": notice.summary
            }
          }))
        }}
      />
      <Navbar />
      {/* 히어로 배너 */}
      <section className="notice-hero" style={{ backgroundColor: '#ffffff' }}>
        <h1 className="notice-hero-title">공지사항</h1>
        <p className="notice-hero-desc">ZOOP의 최신 소식과 업데이트를 한눈에 확인하세요.<br />서비스 개선, 새로운 기능, 이벤트 등 다양한 소식을 제공합니다.</p>
      </section>
      <div className="notice-page">
        <div className="notice-container">
          <ul className="notice-list">
            {[...noticeList]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((notice) => (
                <li key={notice.id} className={`notice-card${selectedId === notice.id ? ' open' : ''}`}
                    tabIndex={0} onClick={() => toggleNotice(notice.id)} onKeyPress={e => (e.key === 'Enter' || e.key === ' ') && toggleNotice(notice.id)}>
                  <div className="notice-card-header">
                    <div className="notice-card-title-row">
                      <span className="notice-card-title">{notice.title}</span>
                      {isNew(notice.date) && <span className="notice-badge-new">NEW</span>}
                    </div>
                    <span className="notice-card-date">{notice.date}</span>
                  </div>
                  <div className="notice-card-summary">{notice.summary}</div>
                  <div className={`notice-card-detail${selectedId === notice.id ? ' open' : ''}`}>{selectedId === notice.id && notice.detail}</div>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export default Notice; 
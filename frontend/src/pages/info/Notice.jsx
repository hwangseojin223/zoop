import React from 'react';
import './Notice.css';
import Navbar from '../../components/Navbar';

const dummyNotices = [
  {
    id: 1,
    title: '정부지원 대출찾기 서비스 제공 종료 안내',
    date: '2025.07.03',
  },
  {
    id: 2,
    title: '최저금리 정기조회 서비스 제공 종료 안내',
    date: '2025.07.03',
  },
  {
    id: 3,
    title: '5월 대출신청 이벤트 당첨자 안내',
    date: '2025.06.27',
  },
  {
    id: 4,
    title: '잔소리봇 소비 분석 서비스 종료 안내',
    date: '2025.06.19',
  },
  {
    id: 5,
    title: '카드 본인확인 서비스 종료 안내',
    date: '2025.06.12',
  },
  {
    id: 6,
    title: '대출신청 이벤트 당첨자 안내',
    date: '2025.05.20',
  },
  {
    id: 7,
    title: '위치정보사업 및 위치기반서비스 이용약관 변경 안내',
    date: '2025.05.10',
  },
];

function Notice() {
  return (
    <>
      <Navbar />
      <div className="notice-page">
        <div className="notice-container">
          <h1 className="notice-title">공지사항</h1>
          <ul className="notice-list">
            {dummyNotices.map((notice) => (
              <li key={notice.id} className="notice-item">
                <div className="notice-item-title">{notice.title}</div>
                <div className="notice-item-date">{notice.date}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export default Notice; 
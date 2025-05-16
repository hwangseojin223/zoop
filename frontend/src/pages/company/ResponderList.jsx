import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';

export default function ResponderList() {
  const [responder, setResponder] = useState([]);

  useEffect(() => {
    // 아래에 어떤 페이지로 요청할것인지
    // 1은 임시로.
    fetch('http://localhost:8081/api/responder/1')
      .then(res => res.json())
      .then(data => setResponder(data))
      .catch(err => console.error('❌ 후보자 목록 오류:', err));
  }, []);

  console.log(responder);

  return (
    <div>
      <Navbar />
      <div style={{ padding: '7rem 3rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>🔍 GitHub 후보자 목록</h2>
        {responder.length === 0 ? (
          <p>회신자가 없습니다.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {responder.map((r, i) => (
              <li key={i} style={{ marginBottom: '1.5rem', padding: '1.2rem', border: '1px solid #ddd', borderRadius: '8px' }}>
                <strong>이메일 : {r.email}</strong><br />
                <strong>이름 : {r.name}</strong><br />
                <strong>지역 : {r.location}</strong><br />
                <strong>언어 : {r.languages}</strong><br />
                <strong>점수 : {r.score}</strong><br />
                <strong>분석 : {r.portfolioAnalysis}</strong><br />
                {/* <a href={r.githubProfileUrl} target="_blank" rel="noreferrer">{r.githubProfileUrl}</a><br />
                <span>검색일: {r.githubSearchDate?.substring(0, 10)}</span> */}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

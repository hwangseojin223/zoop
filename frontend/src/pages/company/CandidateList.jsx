import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';

export default function CandidateList() {
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8081/api/github-search/results')
      .then(res => res.json())
      .then(data => setCandidates(data))
      .catch(err => console.error('❌ 후보자 목록 오류:', err));
  }, []);

  return (
    <div>
      <Navbar />
      <div style={{ padding: '7rem 3rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>🔍 GitHub 후보자 목록</h2>
        {candidates.length === 0 ? (
          <p>후보자가 없습니다.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {candidates.map((c, i) => (
              <li key={i} style={{ marginBottom: '1.5rem', padding: '1.2rem', border: '1px solid #ddd', borderRadius: '8px' }}>
                <strong>{c.githubLogin}</strong><br />
                <a href={c.githubProfileUrl} target="_blank" rel="noreferrer">{c.githubProfileUrl}</a><br />
                <span>검색일: {c.githubSearchDate?.substring(0, 10)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

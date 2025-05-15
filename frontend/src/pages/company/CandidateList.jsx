import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';

export default function CandidateList() {
  const { postId } = useParams();
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:8081/api/github-search/by-post/${postId}`)
      .then(res => res.json())
      .then(data => {
        console.log("🔥 candidates data from Spring:", data);
        setCandidates(data);
      })
      .catch(err => console.error('❌ 후보자 목록 오류:', err));
  }, [postId]);

  const validEmail = email => email && email !== 'not_found@example.com';

  const emailCandidates = candidates
    .filter(c => validEmail(c.candidateEmail))
    .sort((a, b) => (b.analysisScore || 0) - (a.analysisScore || 0));

  const noEmailCandidates = candidates
    .filter(c => !validEmail(c.candidateEmail))
    .sort((a, b) => (b.analysisScore || 0) - (a.analysisScore || 0));

  const sectionStyle = {
    padding: '2rem',
    marginBottom: '3rem',
    border: '2px solid #e5e5e5',
    borderRadius: '14px',
    backgroundColor: '#fefefe',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
  };

  const titleStyle = {
    fontSize: '1.25rem',
    fontWeight: 700,
    marginBottom: '1.5rem',
    paddingBottom: '0.5rem',
    borderBottom: '2px solid #ddd',
    color: '#333'
  };

  const cardStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '1.2rem',
    marginBottom: '1rem',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '12px',
    boxShadow: '0 1px 5px rgba(0,0,0,0.05)',
  };

  const avatarStyle = {
    width: 60,
    height: 60,
    borderRadius: '50%',
    marginRight: '1.5rem',
  };

  const labelGray = { color: '#777' };

  return (
    <div>
      <Navbar />
      <div style={{ padding: '7rem 3rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2.5rem' }}>
          🔍 GitHub 후보자 목록 (공고 ID: {postId})
        </h2>

        {candidates.length === 0 ? (
          <p>후보자가 없습니다.</p>
        ) : (
          <>
            {/* ✅ 이메일 있는 사람들 */}
            <div style={sectionStyle}>
              <h3 style={{ ...titleStyle, color: '#4CAF50' }}>📧 이메일 보유자 (우선순위)</h3>
              {emailCandidates.map((c, i) => (
                <div key={i} style={cardStyle}>
                  <img
                    src={`https://github.com/${c.githubLogin}.png`}
                    alt="avatar"
                    style={avatarStyle}
                  />
                  <div>
                    <strong>{c.githubLogin}</strong><br />
                    <a
                      href={c.githubProfileUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: 'none', color: '#2196F3', fontWeight: 500 }}
                    >
                      방문하기 →
                    </a>
                    <p>📧 이메일: {c.candidateEmail}</p>
                    <p>📊 점수: {c.analysisScore?.toFixed(1) ?? '없음'}</p>
                    <p>📅 검색일: {c.githubSearchDate?.substring(0, 10)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ❌ 이메일 없는 사람들 */}
            <div style={sectionStyle}>
              <h3 style={{ ...titleStyle, color: '#FF7043' }}>🚫 이메일 없음</h3>
              {noEmailCandidates.map((c, i) => (
                <div key={i} style={cardStyle}>
                  <img
                    src={`https://github.com/${c.githubLogin}.png`}
                    alt="avatar"
                    style={avatarStyle}
                  />
                  <div>
                    <strong>{c.githubLogin}</strong><br />
                    <a
                      href={c.githubProfileUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: 'none', color: '#2196F3', fontWeight: 500 }}
                    >
                      방문하기 →
                    </a>
                    <p>📧 이메일: <span style={labelGray}>없음</span></p>
                    <p>📊 점수: {c.analysisScore?.toFixed(1) ?? '없음'}</p>
                    <p>📅 검색일: {c.githubSearchDate?.substring(0, 10)}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { FaGithub, FaEnvelope } from 'react-icons/fa';

export default function CandidateList() {
  const { postId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [postTitle, setPostTitle] = useState('');

  useEffect(() => {
    fetch(`http://localhost:8081/api/postings/info/${postId}`)
      .then(res => res.json())
      .then(data => {
        setPostTitle(data.postTitle || '공고 제목 없음');
      });

    fetch(`http://localhost:8081/api/github-search/by-post/${postId}`)
      .then(res => res.json())
      .then(data => {
        const emailFirst = data.filter(c => c.candidateEmail !== 'not_found@example.com');
        const noEmail = data.filter(c => c.candidateEmail === 'not_found@example.com');
        setCandidates([...emailFirst, ...noEmail]);
      })
      .catch(err => console.error('❌ 후보자 목록 오류:', err));
  }, [postId]);

  const Card = ({ c }) => (
    <li
      style={{
        marginBottom: '1.5rem',
        padding: '1.2rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        backgroundColor: '#fafafa'
      }}
    >
      <img
        src={`https://github.com/${c.githubLogin}.png`}
        alt="avatar"
        width={50}
        style={{ borderRadius: '50%' }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <strong style={{ fontSize: '1.05rem' }}>{c.githubLogin}</strong>
          <a href={c.githubProfileUrl} target="_blank" rel="noreferrer">
            <FaGithub size={18} color="#333" />
          </a>
        </div>
        <p>📧 이메일: {c.candidateEmail === 'not_found@example.com' ? '없음' : c.candidateEmail}</p>
        <p>📊 점수: {c.analysisScore != null ? c.analysisScore.toFixed(1) : '없음'}</p>
        <p>📅 검색일: {c.githubSearchDate?.substring(0, 10)}</p>
      </div>
      {c.candidateEmail !== 'not_found@example.com' && (
        <a
          href={`mailto:${c.candidateEmail}`}
          style={{
            backgroundColor: '#30c59b',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '999px',
            textDecoration: 'none',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FaEnvelope /> 이메일 보내기
        </a>
      )}
    </li>
  );

  return (
    <div>
      <Navbar />
      <div style={{ padding: '7rem 3rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2.5rem' }}>
          🔍 GitHub 후보자 목록 — <span style={{ color: '#30c59b' }}>{postTitle}</span>
        </h2>

        {/* 이메일 있는 사람들 */}
        <section style={{ marginBottom: '4rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>📬 이메일 있는 후보자</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {candidates
              .filter(c => c.candidateEmail !== 'not_found@example.com')
              .map((c, i) => <Card key={i} c={c} />)}
          </ul>
        </section>

        {/* 이메일 없는 사람들 */}
        <section>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>❌ 이메일 없는 후보자</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {candidates
              .filter(c => c.candidateEmail === 'not_found@example.com')
              .map((c, i) => <Card key={i} c={c} />)}
          </ul>
        </section>
      </div>
    </div>
  );
}

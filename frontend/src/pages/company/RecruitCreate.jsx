import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { FaEdit } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

export default function RecruitCreate() {
  const navigate = useNavigate();
  const { authState } = useAuth();

  const [filters, setFilters] = useState({
    roles: [],
    languages: [],
    regions: [],
    nationwide: false,
    salary: 5000,
    headcount: 5
  });

  const toggleSelection = (field, value) => {
    setFilters((prev) => {
      const set = new Set(prev[field]);
      set.has(value) ? set.delete(value) : set.add(value);
      return { ...prev, [field]: Array.from(set) };
    });
  };

  const handleSliderChange = (field) => (e) => {
    setFilters((prev) => ({ ...prev, [field]: parseInt(e.target.value, 10) }));
  };

  const handleNationwideToggle = () => {
    setFilters((prev) => ({ ...prev, nationwide: !prev.nationwide }));
  };

  const handleSubmit = async () => {
    try {
        const token = localStorage.getItem('jwtToken');


      // 1. 공고 등록 요청
      const recruitRes = await fetch('http://localhost:8081/api/postings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}` // ✅ 헤더에 포함
        },
        body: JSON.stringify({
          postTitle: '프론트엔드 개발자 채용',
          postDescription: '우리는 멋진 프론트엔드 개발자를 찾고 있습니다.',
          postProgrammingLanguage: filters.languages.join(','),
          postLocation: filters.regions.join(','),
          postHeadcount: filters.headcount,
          postSalaryStart: '3000만원',
          postSalaryEnd: `${filters.salary}만원`,
          postPostedDate: new Date().toISOString().split('T')[0],
          postExpiryDate: null,
          postStatus: 'Open'
        })
      });

      if (!recruitRes.ok) throw new Error('공고 등록 실패');

      const { postId } = await recruitRes.json();

      // 2. GitHub 필터링 요청
      const filterRes = await fetch('http://localhost:8081/api/github-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...filters, postId })
      });

      if (filterRes.ok) {
        alert('공고 등록 및 GitHub 후보자 수집 완료!');
        navigate('/company/candidates');
      } else {
        alert('후보자 저장 실패');
      }
    } catch (err) {
      console.error(err);
      alert('서버 오류 발생');
    }
  };
  
  
  
  
  

  const chipStyle = (selected) => ({
    border: '1.5px solid #30c59b',
    color: selected ? 'white' : '#30c59b',
    backgroundColor: selected ? '#30c59b' : 'transparent',
    borderRadius: '999px',
    padding: '0.6rem 1.2rem',
    fontSize: '0.95rem',
    fontWeight: 500,
    cursor: 'pointer',
  });

  const sliderStyle = {
    width: '100%',
    appearance: 'none',
    height: '14px',
    borderRadius: '8px',
    backgroundColor: '#c8f5dc',
    outline: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    accentColor: '#30c59b',
    transition: 'background 0.3s ease-in-out'
  };

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: '3rem' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111', marginBottom: '1rem' }}>{title}</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>{children}</div>
    </div>
  );

  return (
    <div style={{ fontFamily: 'SUIT, sans-serif', backgroundColor: '#fefefe', minHeight: '100vh' }}>
      <Navbar />

      <div className="dashboard-container" style={{ display: 'flex', alignItems: 'flex-start', marginTop: '6rem' }}>
        <aside
          style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            marginLeft: '3rem',
            marginTop: '7.6rem',
            width: '280px',
            position: 'sticky',
            top: '6rem',
            height: 'fit-content',
            fontSize: '0.85rem',
            color: '#222',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#111', marginBottom: '1.5rem' }}>📢 공고 관리</h3>
          {[1, 2, 3].map(num => {
            const key = `공고${num}`;
            const name = num === 1 ? '공고 1' : num === 2 ? '공고 2' : '공고 3';
            return (
              <div key={key} style={{ marginBottom: '1.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{ fontWeight: '600', fontSize: '0.9rem', color: key === '공고1' ? '#30c59b' : '#333' }}
                  >
                    {name}
                  </div>
                  <FaEdit
                    style={{ cursor: 'pointer', fontSize: '0.85rem', color: '#888' }}
                  />
                </div>
                {key === '공고1' && (
                  <div style={{ backgroundColor: '#e8f8f0', borderRadius: '10px', padding: '0.9rem 1rem', marginTop: '0.6rem', boxShadow: 'inset 0 0 0.5px rgba(0,0,0,0.05)' }}>
                    <ul style={{ paddingLeft: '0.8rem', fontSize: '0.9rem', color: '#444', lineHeight: '1.6', margin: 0 }}>
                      <li style={{ cursor: 'pointer', color: '#30c59b', fontWeight: 600 }}>새 채용 시작</li>
                      <li style={{ cursor: 'pointer' }} onClick={() => navigate('/company/dashboard')}>후보자 목록</li>
                      <li style={{ cursor: 'pointer' }} onClick={() => navigate('/company/dashboard')}>회신자 목록</li>
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </aside>

        <main style={{ flex: 1, padding: '6rem 3rem 4rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '2.5rem' }}>필터링 기준을 선택하세요</h2>

          <Section title="원하는 직무를 선택하세요">
            {["개발PM", "데이터엔지니어", "백엔드/서버개발", "앱개발", "보안관제", "정보보안", "프론트엔드", "웹개발", "시스템엔지니어"].map((role) => (
              <div key={role} onClick={() => toggleSelection('roles', role)} style={chipStyle(filters.roles.includes(role))}>{role}</div>
            ))}
          </Section>

          <Section title="원하는 언어를 선택하세요">
            {["Python", "JavaScript", "Java", "C++", "Go", "Ruby", "Kotlin", "TypeScript"].map((lang) => (
              <div key={lang} onClick={() => toggleSelection('languages', lang)} style={chipStyle(filters.languages.includes(lang))}>{lang}</div>
            ))}
          </Section>

          <Section title="원하는 지역을 선택하세요">
            {["서울", "인천", "경기", "부산", "대구", "광주", "대전", "세종", "울산", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"].map((region) => (
              <div key={region} onClick={() => toggleSelection('regions', region)} style={chipStyle(filters.regions.includes(region))}>{region}</div>
            ))}
            <div onClick={handleNationwideToggle} style={chipStyle(filters.nationwide)}>지역 상관없음 (전국)</div>
          </Section>

          <Section title="예상 연봉 수준은?">
            <p style={{ marginBottom: '0.5rem', fontSize: '0.95rem', color: '#444' }}>연봉: {filters.salary.toLocaleString()}만원</p>
            <input
              type="range"
              min="2000"
              max="10000"
              step="100"
              value={filters.salary}
              onChange={handleSliderChange('salary')}
              style={sliderStyle}
            />
          </Section>

          <Section title="채용 인원 규모는?">
            <p style={{ marginBottom: '0.5rem', fontSize: '0.95rem', color: '#444' }}>전체 인원: {filters.headcount}명</p>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={filters.headcount}
              onChange={handleSliderChange('headcount')}
              style={sliderStyle}
            />
          </Section>

          <button
            onClick={handleSubmit}
            style={{
              marginTop: '3rem',
              padding: '1rem 2.5rem',
              fontSize: '1rem',
              backgroundColor: '#30c59b',
              color: 'white',
              border: 'none',
              borderRadius: '999px',
              fontWeight: 600,
              boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
              cursor: 'pointer'
            }}
          >
            필터링 적용
          </button>
        </main>
      </div>
    </div>
  );
}

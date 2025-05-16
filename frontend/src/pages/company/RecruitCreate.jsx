import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { motion } from 'framer-motion';

const autoGenerateTitle = ({ position, language, region }) => {
  return `[${position}] ${language} / ${region}`;
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
  transition: 'all 0.2s ease-in-out',
});

const sliderStyle = {
  width: '100%',
  appearance: 'none',
  height: '14px',
  borderRadius: '8px',
  backgroundColor: '#c8f5dc',
  outline: 'none',
  accentColor: '#30c59b',
  transition: 'background 0.3s ease-in-out',
};

const Section = ({ title, children }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: '3rem' }}>
    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111', marginBottom: '1rem' }}>{title}</h3>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>{children}</div>
  </motion.div>
);

export default function RecruitCreate() {
  const navigate = useNavigate();
  const { authState } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [position, setPosition] = useState('');
  const [language, setLanguage] = useState('');
  const [region, setRegion] = useState('');

  const [filters, setFilters] = useState({
    roles: [],
    languages: [],
    regions: [],
    nationwide: false,
    salary: 5000,
    headcount: 5,
  });

  useEffect(() => {
    if (position && language && region) {
      const generated = autoGenerateTitle({ position, language, region });
      setTitle(generated);
    }
  }, [position, language, region]);

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
      if (!title || !description || !expiryDate) {
        alert('공고 제목, 설명, 마감일을 모두 입력해 주세요.');
        return;
      }
      if (filters.languages.length === 0) {
        alert('하나 이상의 언어를 선택해 주세요.');
        return;
      }
      if (!filters.nationwide && filters.regions.length === 0) {
        alert('지역을 선택하거나 "전국"을 체크해주세요.');
        return;
      }

      const today = new Date();
      const expiry = new Date(expiryDate);
      if (expiry < today) {
        alert('마감일은 오늘 이후여야 합니다.');
        return;
      }

      const postingPayload = {
        companyId: Number(localStorage.getItem('companyId')),
        companyAdminId: Number(localStorage.getItem('userId')),
        postTitle: title,
        postDescription: description,
        postProgrammingLanguage: filters.languages.join(', ') || '기타',
        postLocation: filters.nationwide ? '전국' : filters.regions.join(', ') || '전국',
        postHeadcount: filters.headcount,
        postSalaryStart: String(filters.salary),
        postSalaryEnd: String(filters.salary),
        postPostedDate: new Date().toISOString().substring(0, 10),
        postExpiryDate: expiryDate,
        postStatus: 'OPEN',
      };

      const postRes = await fetch('http://localhost:8081/api/postings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
        body: JSON.stringify(postingPayload),
      });

      if (!postRes.ok) throw new Error('공고 등록 실패');
      const postData = await postRes.json();
      const postId = postData.postId;

      const filterDto = {
        postId,
        regions: filters.nationwide ? [] : filters.regions,
        languages: filters.languages,
        nationwide: filters.nationwide,
      };

      await fetch('http://localhost:8081/api/github-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filterDto),
      });

      navigate(`/company/candidates/${postId}`);
    } catch (err) {
      console.error('❌ 등록 오류:', err);
      alert('공고 등록 중 오류 발생!');
    }
  };

  return (
    <div style={{ fontFamily: 'SUIT, sans-serif', backgroundColor: '#f7f9fa', minHeight: '100vh' }}>
      <Navbar />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} style={{ padding: '7rem 3rem 4rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', color: '#111' }}>채용 필터 기준 설정</h2>

        <Section title="직무">
          {["개발PM", "데이터엔지니어", "백엔드/서버개발", "앱개발", "보안관제", "정보보안", "프론트엔드", "웹개발", "시스템엔지니어"].map((role) => (
            <div key={role} onClick={() => {
              toggleSelection('roles', role);
              setPosition(role);
            }} style={chipStyle(filters.roles.includes(role))}>{role}</div>
          ))}
        </Section>

        <Section title="언어">
          {["Python", "JavaScript", "Java", "C++", "Go", "Ruby", "Kotlin", "TypeScript"].map((lang) => (
            <div key={lang} onClick={() => {
              toggleSelection('languages', lang);
              setLanguage(lang);
            }} style={chipStyle(filters.languages.includes(lang))}>{lang}</div>
          ))}
        </Section>

        <Section title="지역">
          {["서울", "인천", "경기", "부산", "대구", "광주", "대전", "세종", "울산", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"].map((region) => (
            <div key={region} onClick={() => {
              toggleSelection('regions', region);
              setRegion(region);
            }} style={chipStyle(filters.regions.includes(region))}>{region}</div>
          ))}
          <div onClick={handleNationwideToggle} style={chipStyle(filters.nationwide)}>지역 상관없음 (전국)</div>
        </Section>

        <Section title="연봉 (만원)">
          <p style={{ marginBottom: '0.5rem', fontSize: '0.95rem', color: '#444' }}>{filters.salary.toLocaleString()}만원</p>
          <input type="range" min="2000" max="10000" step="100" value={filters.salary} onChange={handleSliderChange('salary')} style={sliderStyle} />
        </Section>

        <Section title="채용 인원">
          <p style={{ marginBottom: '0.5rem', fontSize: '0.95rem', color: '#444' }}>{filters.headcount}명</p>
          <input type="range" min="1" max="100" step="1" value={filters.headcount} onChange={handleSliderChange('headcount')} style={sliderStyle} />
        </Section>

        <Section title="상세 설명">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="공고에 대한 상세 설명을 입력하세요."
            rows="6"
            style={{
              padding: '0.8rem',
              borderRadius: '8px',
              border: '1px solid #ccc',
              width: '100%',
              fontSize: '1rem',
              resize: 'vertical'
            }}
          />
        </Section>

        <Section title="공고 마감일">
          <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} style={{
            padding: '0.8rem',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '1rem',
          }} />
        </Section>

        <motion.button
          onClick={handleSubmit}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
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
        </motion.button>
      </motion.div>
    </div>
  );
}
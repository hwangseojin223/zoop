import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { FaEdit } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function CompanyDashboard() {
  const [openSection, setOpenSection] = useState('공고1');
  const [notice1Name, setNotice1Name] = useState('공고 1');
  const [notice2Name, setNotice2Name] = useState('공고 2');
  const [notice3Name, setNotice3Name] = useState('공고 3');
  const [editing, setEditing] = useState('');
  const [tempName, setTempName] = useState('');
  const [companyInfo, setCompanyInfo] = useState(null);
  const { authState } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const res = await axios.get(`http://localhost:8081/api/companyadmins/info/${authState.userId}`);
        setCompanyInfo(res.data);
      } catch (error) {
        console.error('❌ 기업 정보 불러오기 실패:', error);
      }
    };

    if (authState.userId) fetchCompanyInfo();
  }, [authState.userId]);

  const handleToggle = (name) => {
    setOpenSection(openSection === name ? '' : name);
  };

  const startEditing = (name, currentValue) => {
    setEditing(name);
    setTempName(currentValue);
  };

  const handleEditSave = () => {
    if (editing === '공고1') setNotice1Name(tempName);
    if (editing === '공고2') setNotice2Name(tempName);
    if (editing === '공고3') setNotice3Name(tempName);
    setEditing('');
  };

  const hoverBoxStyle = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
  };

  const [draftPosts, setDraftPosts] = useState([]);
const handleAddDraftPost = () => {
  const newId = draftPosts.length + 1;
  setDraftPosts([...draftPosts, { id: newId, title: `공고 ${newId}` }]);
};

const handleStartRecruit = (draftId) => {
  navigate('/company/recruit/create', { state: { draftId } });
};


  return (
    <div className="company-dashboard" style={{ fontFamily: 'SUIT, Apple SD Gothic Neo, sans-serif', backgroundColor: '#fefefe', minHeight: '100vh' }}>
      <Navbar />

      <div className="dashboard-container" style={{ display: 'flex', marginTop: '6rem', alignItems: 'flex-start' }}>
      <aside
        style={{
            ...hoverBoxStyle,
            marginTop: '7.6rem',
            marginLeft: '3rem',
            padding: '2rem',
            width: '280px',
            position: 'sticky',
            top: '6rem',
            height: 'fit-content',
            fontSize: '0.85rem',
            color: '#222',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        >
        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#111', marginBottom: '1.5rem' }}>
            📢 공고 관리
        </h3>
        <button
            onClick={handleAddDraftPost}
            style={{
            backgroundColor: '#30c59b',
            color: 'white',
            padding: '0.6rem 1.2rem',
            border: 'none',
            borderRadius: '999px',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: 'pointer',
            width: '100%',
            marginBottom: '2rem',
            }}
        >
            ➕ 새 공고 추가
        </button>

        {draftPosts.map((post) => (
            <div key={post.id} style={{ marginBottom: '1.8rem' }}>
            <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#333' }}>
                {post.title}
            </div>
            <div
                style={{
                backgroundColor: '#e8f8f0',
                borderRadius: '10px',
                padding: '0.9rem 1rem',
                marginTop: '0.6rem',
                boxShadow: 'inset 0 0 0.5px rgba(0,0,0,0.05)',
                }}
            >
                <ul
                style={{
                    paddingLeft: '0.8rem',
                    fontSize: '0.9rem',
                    color: '#444',
                    lineHeight: '1.6',
                    margin: 0,
                }}
                >
                <li style={{ cursor: 'pointer' }} onClick={() => handleStartRecruit(post.id)}>
                    새 채용 시작
                </li>
                </ul>
            </div>
            </div>
        ))}

        </aside>


        <main style={{ flex: 1, padding: '4rem 3rem', backgroundColor: '#fefefe' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.8rem', color: '#111' }}>기업 정보</h2>
          <section style={{ backgroundColor: '#fcfcfc', border: '0.5px solid #eeeeee', borderRadius: '12px', padding: '2.5rem', marginBottom: '2.5rem', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            {companyInfo ? (
              <div style={{ lineHeight: '2rem', color: '#555', fontSize: '0.95rem' }}>
                <div><strong>기업 이름:</strong> {companyInfo.companyName}</div>
                <div><strong>사업자번호:</strong> {companyInfo.businessNumber}</div>
                <div><strong>대표자명:</strong> {companyInfo.ceoName}</div>
                <div><strong>관리자명:</strong> {companyInfo.adminName}</div>
                <div><strong>이메일:</strong> {companyInfo.email}</div>
                <div><strong>주소:</strong> {companyInfo.address}</div>
              </div>
            ) : (
              <p style={{ color: '#888' }}>기업 정보를 불러오는 중...</p>
            )}
          </section>

          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.8rem', color: '#111' }}>진행 중인 채용</h2>
          <section style={{ ...hoverBoxStyle }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <p style={{ color: '#444' }}>아직 db 추가 안 됨!!</p>
          </section>

          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.8rem', color: '#111' }}>면접 예정자</h2>
          <section style={{ ...hoverBoxStyle }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <ul style={{ color: '#444' }}>
              <li>홍길동 – 5월 20일 14:00</li>
              <li>이길동 – 5월 21일 10:30</li>
            </ul>
          </section>

          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.8rem', color: '#111' }}>과거 채용 내역</h2>
          <section style={{ ...hoverBoxStyle }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <ul style={{ color: '#444' }}>
              <li>2024년 11월 - 백엔드 개발자 채용</li>
              <li>2023년 08월 - 프론트엔드 인턴 채용</li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}
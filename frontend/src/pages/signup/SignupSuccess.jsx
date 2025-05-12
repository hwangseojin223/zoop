import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

export default function SignupSuccess() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '14rem' }}>
        <h2 style={{ fontSize: '2rem', color: '#2dc997' }}>🎉 회원가입이 완료되었습니다!</h2>
        <p style={{ marginTop: '1rem', fontSize: '1.1rem', color: '#333' }}>
          기업 관리자 계정이 성공적으로 등록되었습니다.
        </p>
        <button
          onClick={() => navigate('/auth/login')}
          style={{
            marginTop: '2rem',
            backgroundColor: '#e0f7ea',
            color: '#111',
            fontWeight: '600',
            fontSize: '0.95rem',
            padding: '0.6rem 1.2rem',
            borderRadius: '999px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: 'none'
          }}
        >
          <span role="img" aria-label="arrow">👉</span> 로그인하러 가기
        </button>
      </div>
    </>
  );
}

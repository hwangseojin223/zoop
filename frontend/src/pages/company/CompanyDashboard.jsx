import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

export default function CompanyDashboard() {
  const { authState, setAuthState } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    setAuthState({ token: null, userType: null, userId: null });
    navigate('/auth/login');
  };

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '8rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          안녕하세요, 기업 관리자님 👋
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#555' }}>
            ID: {authState.loginId}
        </p>

        <div style={{ marginTop: '2rem' }}>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2dc997',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            로그아웃
          </button>
        </div>
      </div>
    </>
  );
}

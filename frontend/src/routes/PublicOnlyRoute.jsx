// src/routes/PublicOnlyRoute.jsx
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicOnlyRoute({ children }) {
  const { authState, isInitialized } = useAuth();
  const location = useLocation();

  // 로고 클릭으로 인한 홈페이지 접근인지 확인
  const isLogoClick = sessionStorage.getItem('logoClick') === 'true';
  
  // useEffect를 항상 호출하도록 수정
  useEffect(() => {
    if (isLogoClick) {
      const timer = setTimeout(() => {
        sessionStorage.removeItem('logoClick');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLogoClick]);

  if (!isInitialized) return null;

  // 로고 클릭으로 접근한 경우 항상 홈페이지 표시
  if (isLogoClick) {
    return children;
  }

  // 로그인된 사용자가 일반적으로 홈페이지에 접근하면 대시보드로 리다이렉트
  if (authState.token && !isLogoClick) {
    if (authState.userType === 'candidate') {
      return <Navigate to="/candidate/dashboard" replace />;
    } else if (authState.userType === 'company') {
      return <Navigate to="/company/dashboard" replace />;
    }
    // 기본값은 기업 대시보드
    return <Navigate to="/company/dashboard" replace />;
  }

  return children;
}

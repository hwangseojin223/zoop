// src/routes/PublicOnlyRoute.jsx
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicOnlyRoute({ children }) {
  const { authState, isInitialized } = useAuth();
  const location = useLocation();

  // 로고 클릭으로 인한 홈페이지 접근인지 확인
  const isLogoClick = sessionStorage.getItem('logoClick') === 'true';
  
  console.log('PublicOnlyRoute - isLogoClick:', isLogoClick);
  console.log('PublicOnlyRoute - authState.token:', !!authState.token);
  console.log('PublicOnlyRoute - current path:', location.pathname);

  // useEffect를 항상 호출하도록 수정
  useEffect(() => {
    if (isLogoClick) {
      const timer = setTimeout(() => {
        console.log('PublicOnlyRoute - 로고 클릭 플래그 제거 (지연)');
        sessionStorage.removeItem('logoClick');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLogoClick]);

  if (!isInitialized) return null;

  if (authState.token && !isLogoClick) {
    console.log('PublicOnlyRoute - 리다이렉트 실행');
    // 사용자 타입에 따라 적절한 대시보드로 리다이렉트
    if (authState.userType === 'candidate') {
      return <Navigate to="/candidate/dashboard" replace />;
    } else if (authState.userType === 'company') {
      return <Navigate to="/company/dashboard" replace />;
    }
    // 기본값은 기업 대시보드
    return <Navigate to="/company/dashboard" replace />;
  }

  if (isLogoClick) {
    console.log('PublicOnlyRoute - 홈페이지 렌더링 (로고 클릭)');
    return children;
  }

  console.log('PublicOnlyRoute - 홈페이지 렌더링');
  return children;
}

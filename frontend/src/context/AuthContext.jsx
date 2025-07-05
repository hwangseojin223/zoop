// src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Context 객체 생성
const AuthContext = createContext();

// 2. Provider 컴포넌트 정의
export function AuthProvider({ children }) {
    const [authState, setAuthState] = useState({
      token: null,
      userType: null,
      userId: null,
      loginId: null,
      // 필요한 경우 사용자 이름 등 추가 정보 필드
    });

    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
      const token = localStorage.getItem('jwtToken');
      const userType = localStorage.getItem('userType');
      const userId = localStorage.getItem('userId');
      const loginId = localStorage.getItem('loginId');
      // 필요한 경우 userName 등 추가 정보 로드

      if (token && userType && userId && loginId) {
        setAuthState({ token, userType, userId, loginId }); // 필요한 정보 포함
      }
      setIsInitialized(true); // ✅ 상태 복원 완료 표시
    }, []);

    // ✅ 로그아웃 함수 정의
    const logout = () => {
      // 로컬 스토리지에서 인증 관련 정보 제거
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('userId');
      localStorage.removeItem('loginId');
      // 필요한 경우 userName 등 추가 정보 제거

      // authState 상태 초기화
      setAuthState({
        token: null,
        userType: null,
        userId: null,
        loginId: null,
        // 필요한 경우 추가 정보 필드도 null로 초기화
      });
    };

    return (
      // ✅ value prop에 logout 함수 포함
      <AuthContext.Provider value={{ authState, setAuthState, isInitialized, logout }}>
        {children}
      </AuthContext.Provider>
    );
  }


// 4. Custom hook for easy access
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // useAuth 훅이 AuthProvider 내부에서 사용되지 않았을 때 오류 발생
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

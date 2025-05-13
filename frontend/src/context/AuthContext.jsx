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
  });

  // 3. 페이지 새로고침 시 LocalStorage에서 로그인 정보 복원
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    const userType = localStorage.getItem('userType');
    const userId = localStorage.getItem('userId');
    if (token && userType && userId) {
      setAuthState({ token, userType, userId });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ authState, setAuthState }}>
      {children}
    </AuthContext.Provider>
  );
}

// 4. Custom hook for easy access
export function useAuth() {
  return useContext(AuthContext);
}

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
    });
  
    const [isInitialized, setIsInitialized] = useState(false);
  
    useEffect(() => {
      const token = localStorage.getItem('jwtToken');
      const userType = localStorage.getItem('userType');
      const userId = localStorage.getItem('userId');
      const loginId = localStorage.getItem('loginId');
      if (token && userType && userId && loginId) {
        setAuthState({ token, userType, userId, loginId });
      }
      setIsInitialized(true); // ✅ 상태 복원 완료 표시
    }, []);
  
    return (
      <AuthContext.Provider value={{ authState, setAuthState, isInitialized }}>
        {children}
      </AuthContext.Provider>
    );
  }
  

// 4. Custom hook for easy access
export function useAuth() {
  return useContext(AuthContext);
}

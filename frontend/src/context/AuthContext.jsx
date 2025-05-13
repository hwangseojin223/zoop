// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

// AuthContext 생성
const AuthContext = createContext(null);

// AuthProvider 컴포넌트: 로그인 상태를 관리하고 하위 컴포넌트에 제공
export const AuthProvider = ({ children }) => {
  // 초기 상태는 로컬 스토리지에서 JWT 토큰 및 사용자 정보를 확인하여 설정
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // 사용자 정보 (ID, Type 등)

  // 컴포넌트 마운트 시 로컬 스토리지 확인
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    const storedUser = localStorage.getItem('user'); // 사용자 정보도 저장했다면 로드

    if (token && storedUser) {
      // 토큰과 사용자 정보가 있다면 로그인 상태로 설정
      try {
         const parsedUser = JSON.parse(storedUser);
         setIsLoggedIn(true);
         setUser(parsedUser);
         console.log("✅ 로컬 스토리지에서 사용자 정보 로드:", parsedUser);
      } catch (e) {
         console.error("로컬 스토리지 사용자 정보 파싱 오류:", e);
         // 오류 발생 시 로그인 상태 초기화
         logout();
      }
    } else {
      // 토큰이나 사용자 정보가 없다면 로그인 상태 초기화
      logout();
    }
  }, []); // 최초 마운트 시에만 실행

  // 로그인 처리 함수
  const login = (userData, token) => {
    setIsLoggedIn(true);
    setUser(userData); // { userId: ..., userType: ..., loginId: ... } 형태의 객체
    localStorage.setItem('jwtToken', token); // JWT 토큰 로컬 스토리지에 저장
    localStorage.setItem('user', JSON.stringify(userData)); // 사용자 정보도 JSON 문자열로 저장
    console.log("✅ 로그인 성공, 사용자 정보 저장:", userData);
  };

  // 로그아웃 처리 함수
  const logout = () => {
    setIsLoggedIn(false);
    setUser(null); // 사용자 정보 초기화
    localStorage.removeItem('jwtToken'); // JWT 토큰 삭제
    localStorage.removeItem('user'); // 사용자 정보 삭제
    console.log("✅ 로그아웃 처리, 사용자 정보 삭제");
    // TODO: 필요 시 백엔드에 로그아웃 요청 보낼 수 있음
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Context 값을 사용하기 위한 커스텀 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

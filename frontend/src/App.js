import React, { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext'; // 로그인 전역 상태 관리

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './pages/signup/Signup';
import Index from './pages/Index';
import CompanySignupProcess from './pages/signup/CompanySignupProcess';
import CompanyAdminSignup from './pages/signup/CompanyAdminSignup';
import SignupSuccess from './pages/signup/SignupSuccess';
import LoginSelectionPage from './pages/login/LoginSelectionPage';
import { useAuth } from './context/AuthContext'; // ✅ useAuth import 필요

function AppContent() {
  const { setAuthState } = useAuth();

  // ✅ 앱 로드 시 로그인 상태 복원
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    const userType = localStorage.getItem('userType');
    const userId = localStorage.getItem('userId');

    if (token && userType && userId) {
      setAuthState({ token, userType, userId });
    }
  }, [setAuthState]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth/applicant/signup" element={<Signup />} />
        <Route path="/auth/company/signup/process" element={<CompanySignupProcess />} />
        <Route path="/auth/company/signup/companyadmin" element={<CompanyAdminSignup />} />
        <Route path="/auth/company/signup/success" element={<SignupSuccess />} />
        <Route path="/auth/login" element={<LoginSelectionPage />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

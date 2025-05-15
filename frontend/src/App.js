import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Signup from './pages/signup/Signup';
import Index from './pages/Index';
import CompanySignupProcess from './pages/signup/CompanySignupProcess';
import CompanyAdminSignup from './pages/signup/CompanyAdminSignup';
import SignupSuccess from './pages/signup/SignupSuccess';
import ApplicantSignupSuccess from './pages/signup/ApplicantSignupSuccess';
import LoginSelectionPage from './pages/login/LoginSelectionPage';
import CompanyDashboard from './pages/company/CompanyDashboard';
import GoogleAuthCallback from './pages/auth/GoogleAuthCallback';
import ApplicantSignupProcess from './pages/signup/ApplicantSignupProcess';

import PrivateRoute from './routes/PrivateRoute';
import PublicOnlyRoute from './routes/PublicOnlyRoute'; // ✅ 로그아웃 상태만 접근 가능하게 하는 라우터
import RecruitCreate from './pages/company/RecruitCreate';
import CandidateList from './pages/company/CandidateList';

function AppContent() {
  const { setAuthState } = useAuth();

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
        {/* ✅ 로그아웃 상태에서만 접근 가능한 페이지 */}
        <Route
          path="/"
          element={
            <PublicOnlyRoute>
              <Index />
            </PublicOnlyRoute>
          }
        />

        <Route path="/auth/applicant/signup" element={<Signup />} />
        <Route path="/auth/company/signup/process" element={<CompanySignupProcess />} />
        <Route path="/auth/company/signup/companyadmin" element={<CompanyAdminSignup />} />
        <Route path="/auth/company/signup/success" element={<SignupSuccess />} />
        <Route path="/auth/applicant/signup/success" element={<ApplicantSignupSuccess />} />
        <Route path="/auth/applicant/signup/process" element={<ApplicantSignupProcess />} />
        <Route path="/auth/login" element={<LoginSelectionPage />} />
        <Route path="/google-auth" element={<GoogleAuthCallback />} />

        {/* ✅ 로그인 + 기업회원 전용 */}
        <Route
          path="/company/dashboard"
          element={
            <PrivateRoute allowedUserType="company">
              <CompanyDashboard />
            </PrivateRoute>
          }
        />
          <Route
            path="/company/recruit/create"
            element={
              <PrivateRoute allowedUserType="company">
                <RecruitCreate />
              </PrivateRoute>
            }
          />

          <Route
            path="/company/candidates"
            element={
              <PrivateRoute allowedUserType="company">
                <CandidateList />
              </PrivateRoute>
            }
          />

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

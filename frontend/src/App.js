// App.js

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// index
import Index from './pages/Index';

// signup
import Signup from './pages/signup/Signup';
import CompanySignupProcess from './pages/signup/CompanySignupProcess';
import CompanyAdminSignup from './pages/signup/CompanyAdminSignup';
import SignupSuccess from './pages/signup/SignupSuccess';
import ApplicantSignupSuccess from './pages/signup/ApplicantSignupSuccess';
import ApplicantSignupProcess from './pages/signup/ApplicantSignupProcess';

import LoginSelectionPage from './pages/login/LoginSelectionPage';
import GoogleAuthCallback from './pages/auth/GoogleAuthCallback';

import PrivateRoute from './routes/PrivateRoute';
import PublicOnlyRoute from './routes/PublicOnlyRoute';

// company
import CompanyDashboard from './pages/company/CompanyDashboard';
import RecruitCreate from './pages/company/RecruitCreate';
import CandidateList from './pages/company/CandidateList';
import ResponderList from './pages/company/ResponderList';

// info
import About from './pages/info/About';
import Notice from './pages/info/Notice';
import Support from './pages/info/Support';
import FAQ from './pages/info/FAQ';
import Careers from './pages/info/Careers';

// candidate
import CandidateDashboard from './pages/candidate/CandidateDashboard';
// PortfolioSubmissionPage 컴포넌트를 임포트합니다. 실제 파일 경로에 맞게 수정해주세요.
import PortfolioSubmissionPage from './pages/candidate/PortfolioSubmissionPage';


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
        {/* 로그아웃 상태에서만 접근 가능한 페이지 */}
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

        {/* 회사 소개 (공개 접근 가능) */}
        <Route path="/about" element={<About />} />

        {/* 공고별 후보자 목록 페이지 */}
        <Route path="/company/candidates/:postId" element={<CandidateList />} />

        {/* 로그인된 기업회원만 접근 가능 */}
        <Route
          path="/company/dashboard"
          element={
            <PrivateRoute allowedUserType="company">
              <CompanyDashboard />
            </PrivateRoute>
          }
        />

        {/*개인회원 대시보드*/}
        <Route
          path='/candidate/dashboard'
          element={
            <PrivateRoute allowedUserType='candidate'>
              <CandidateDashboard />
            </PrivateRoute>
          }
        />

        {/* 포트폴리오 제출 페이지 라우트 추가 */}
        {/* URL 파라미터로 postId를 받습니다. */}
        {/* 개인회원만 접근 가능하도록 PrivateRoute로 감싸는 것이 좋습니다. */}
        <Route
          path="/submit-portfolio/:postId"
          element={
            <PrivateRoute allowedUserType='candidate'> {/* 개인회원만 접근 허용 */}
              <PortfolioSubmissionPage />
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
              <div style={{ padding: '7rem 3rem' }}>
                <h2>❗ 공고 ID가 누락되었습니다.</h2>
                <p>후보자 목록을 보려면 유효한 공고 ID가 필요합니다.</p>
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/company/responder/:postId"
          element={
            <PrivateRoute allowedUserType="company">
              <ResponderList />
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

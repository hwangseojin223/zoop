import React, { useEffect, useState, useRef } from 'react';
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

// 챗봇 import
import Chatbot from './components/Chatbot';
import './components/Chatbot.css';
// candidate
import CandidateDashboard from './pages/candidate/CandidateDashboard';
// PortfolioSubmissionPage 컴포넌트를 임포트합니다. 실제 파일 경로에 맞게 수정해주세요.
import PortfolioSubmissionPage from './pages/candidate/PortfolioSubmissionPage';
import InterviewPage from './pages/candidate/InterviewPage';
import InterviewSession from './pages/candidate/InterviewSession';

function AppContent() {
  const { setAuthState } = useAuth();
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const btnRef = useRef(null);

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
        <Route path="/about" element={<About />} />
        <Route path="/notice" element={<Notice />} />
        <Route path="/support" element={<Support />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/company/candidates/:postId" element={<CandidateList />} />
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
        <Route
    path="/interview/:id"
    element={
      <PrivateRoute allowedUserType='candidate'> {/* 개인회원만 접근 허용 */}
        <InterviewPage />
      </PrivateRoute>
    }
  />
        <Route
          path="/interview-session/:scheduleId"
          element={
            <PrivateRoute allowedUserType='candidate'>
              <InterviewSession />
            </PrivateRoute>
          }
        />
      </Routes>

      {/* 챗봇 버튼 */}
      <button
        ref={btnRef}
        className={`chatbot-mint-btn${chatbotOpen ? ' open' : ''}`}
        onClick={() => setChatbotOpen(open => !open)}
        aria-label={chatbotOpen ? "챗봇 닫기" : "챗봇 열기"}
      >
        {chatbotOpen ? (
          // 챗봇이 열렸으면 X SVG 아이콘
          <span className="chatbot-x-rect">
            <svg
              width={34}
              height={34}
              viewBox="0 0 32 32"
              fill="none"
              stroke="#757575"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ display: "block" }}
              aria-hidden="true"
              focusable="false"
            >
              <line x1="8" y1="8" x2="24" y2="24" />
              <line x1="24" y1="8" x2="8" y2="24" />
            </svg>
          </span>
        ) : (
          // 챗봇 닫혔으면 채팅 아이콘
          <img
            src="/chat.png"
            alt="챗봇 아이콘"
            style={{
              width: 34,
              height: 34,
              objectFit: "contain",
              display: "block",
              background: "transparent",
              border: "none",
            }}
          />
        )}
      </button>



      {/* 챗봇 창 */}
      <Chatbot
        open={chatbotOpen}
        onClose={() => setChatbotOpen(false)}
        anchorRef={btnRef}
      />
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

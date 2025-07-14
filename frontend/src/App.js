import React, { useEffect, useState, useRef, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import PublicOnlyRoute from './routes/PublicOnlyRoute';
import Chatbot from './components/Chatbot';
import './components/Chatbot.css';

// index
import Index from './pages/Index';

// incident report
import IncidentReportPage from './pages/IncidentReportPage';

// signup - lazy loading으로 변경
const Signup = lazy(() => import('./pages/signup/Signup'));
const CompanySignupProcess = lazy(() => import('./pages/signup/CompanySignupProcess'));
const CompanyAdminSignup = lazy(() => import('./pages/signup/CompanyAdminSignup'));
const SignupSuccess = lazy(() => import('./pages/signup/SignupSuccess'));
const ApplicantSignupSuccess = lazy(() => import('./pages/signup/ApplicantSignupSuccess'));
const ApplicantSignupProcess = lazy(() => import('./pages/signup/ApplicantSignupProcess'));
const LoginSelectionPage = lazy(() => import('./pages/login/LoginSelectionPage'));
const FindIdPage = lazy(() => import('./pages/login/FindIdPage'));
const InvitationHandler = lazy(() => import('./components/InvitationHandler'));
const FindPasswordPage = lazy(() => import('./pages/login/FindPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/login/ResetPasswordPage'));
const GoogleAuthCallback = lazy(() => import('./pages/auth/GoogleAuthCallback'));

// company - lazy loading으로 변경
const CompanyDashboard = lazy(() => import('./pages/company/CompanyDashboard'));
const RecruitCreate = lazy(() => import('./pages/company/RecruitCreate'));
const CandidateList = lazy(() => import('./pages/company/CandidateList'));
const ResponderList = lazy(() => import('./pages/company/ResponderList'));
const StatePage = lazy(() => import('./pages/company/StatePage'));
const IdealCandidate = lazy(() => import('./pages/company/IdealCandidate'));
const InterviewEvaluation = lazy(() => import('./pages/company/InterviewEvaluation'));

// candidate - lazy loading으로 변경
const CandidateDashboard = lazy(() => import('./pages/candidate/Dashboard').then(module => ({ default: module.CandidateDashboard })));
const PortfolioSubmissionPage = lazy(() => import('./pages/candidate/PortfolioSubmissionPage'));
const InterviewPage = lazy(() => import('./pages/candidate/InterviewPage'));
const InterviewSession = lazy(() => import('./pages/candidate/InterviewSession'));

// info - lazy loading으로 변경
const About = lazy(() => import('./pages/info/About'));
const Notice = lazy(() => import('./pages/info/Notice'));
const Support = lazy(() => import('./pages/info/Support'));
const CustomerServicePage = lazy(() => import('./pages/info/CustomerServicePage'));
const FaqPage = lazy(() => import('./pages/info/FaqPage'));
const Careers = lazy(() => import('./pages/info/Careers'));
// const JobDetailPage = lazy(() => import('./pages/info/JobDetailPage'));

// 로딩 스켈레톤 컴포넌트
const LoadingSkeleton = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #eafff7 0%, #b2f5ea 60%, #30c59b 100%)',
    color: '#185f44',
    fontSize: '1.18rem',
    fontWeight: 500,
    fontFamily: 'SUIT, Pretendard, Montserrat, sans-serif',
    letterSpacing: '-0.5px',
    transition: 'background 0.3s',
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '56px',
        height: '56px',
        border: '5px solid #b2f5ea',
        borderTop: '5px solid #30c59b',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 24px',
        boxShadow: '0 4px 24px 0 #30c59b22',
        background: 'rgba(255,255,255,0.2)'
      }}></div>
      <div style={{
        fontWeight: 700,
        fontSize: '1.25rem',
        color: '#19b47a',
        marginBottom: 8
      }}>
        ZOOP
      </div>
      <div style={{
        color: '#185f44',
        fontWeight: 500,
        fontSize: '1.08rem',
        opacity: 0.85
      }}>
        페이지를 불러오는 중입니다...
      </div>
    </div>
  </div>
);

function AppContent() {
  const { setAuthState } = useAuth();
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const btnRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    const userType = localStorage.getItem('userType');
    const userId = localStorage.getItem('userId');
    if (token && userType && userId) {
      setAuthState({ token, userType, userId });
    }
  }, [setAuthState]);

  return (
    <Suspense fallback={<LoadingSkeleton />}>
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
        <Route path="/auth/applicant/signup/process/:token" element={<ApplicantSignupProcess />} />
        
        {/* 메일 링크 처리 라우트 */}
        <Route path="/invite/:token" element={<InvitationHandler />} />
        
        <Route path="/auth/login" element={<LoginSelectionPage />} />
        <Route path="/login" element={<LoginSelectionPage />} />
        <Route path="/find-id" element={<FindIdPage />} />
        <Route path="/find-password" element={<FindPasswordPage />} />
        <Route path="/auth/applicant/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/google-auth" element={<GoogleAuthCallback />} />
        <Route path="/about" element={<About />} />
        <Route path="/notice" element={<Notice />} />
        <Route path="/support" element={<CustomerServicePage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/report" element={<IncidentReportPage />} />
        <Route path="/company/candidates/:postId" element={<CandidateList />} />
        <Route
          path="/company/dashboard"
          element={
            <PrivateRoute allowedUserType="company">
              <CompanyDashboard />
            </PrivateRoute>
          }
        />
        <Route path="/company/state/:postId" element={<StatePage />} />

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
          path="/company/ideal-candidate/:postId"
          element={
            <PrivateRoute allowedUserType="company">
              <IdealCandidate />
            </PrivateRoute>
          }
        />

        <Route
          path="/company/interview-evaluation/:postId/:candidateId"
          element={
            <PrivateRoute allowedUserType="company">
              <InterviewEvaluation />
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
        {/* <Route path="/job/:postId" element={<JobDetailPage />} /> */}
      </Routes>

      {/* 챗봇 버튼: /job/ 페이지에서는 숨김 */}
      {(!location.pathname.startsWith('/job/')) && (
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
            // 챗봇이 닫혔으면 챗봇 아이콘
            <span className="chatbot-bubble">
              <img src="/chat.png" alt="챗봇" style={{ width: 34, height: 34, display: 'block' }} />
            </span>
          )}
        </button>
      )}

      {/* 챗봇 창 */}
      <Chatbot
        open={chatbotOpen}
        onClose={() => setChatbotOpen(false)}
        anchorRef={btnRef}
      />
    </Suspense>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;

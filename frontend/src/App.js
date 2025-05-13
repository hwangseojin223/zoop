import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './pages/signup/Signup';
import Index from './pages/Index';
import CompanySignupProcess from './pages/signup/CompanySignupProcess';
import CompanyAdminSignup from './pages/signup/CompanyAdminSignup';
import SignupSuccess from './pages/signup/SignupSuccess';
import LoginSelectionPage from './pages/login/LoginSelectionPage'; 
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
     <AuthProvider>

     
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth/applicant/signup" element={<Signup />} />
        <Route path="/auth/company/signup/process" element={<CompanySignupProcess />} />
        <Route path="/auth/company/signup/companyadmin" element={<CompanyAdminSignup />} />
        <Route path="/auth/company/signup/success" element={<SignupSuccess />} />
        <Route path="/auth/login" element={<LoginSelectionPage />} /> {/* URL을 /auth/login으로 설정 */}
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;




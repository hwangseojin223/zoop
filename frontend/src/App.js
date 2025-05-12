import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Signup from './pages/signup/Signup';
import Index from './pages/Index';
import CompanySignupProcess from './pages/signup/CompanySignupProcess';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth/applicant/signup" element={<Signup />} />
        <Route path="/auth/company/signup/process" element={<CompanySignupProcess />} />
      </Routes>
    </Router>
  );
}

export default App;




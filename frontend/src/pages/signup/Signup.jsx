import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import './Signup.css';

export default function Signup() {
  const [selectedTab, setSelectedTab] = useState('applicant');
  const navigate = useNavigate();

  const handleSignupClick = () => {
    if (selectedTab === 'company') {
      navigate('/auth/company/signup/process');
    } else {
      navigate('/auth/applicant/signup/process');
    }
  };

  return (
    <>
      <Navbar />

      <div className="signup-wrapper">
        <div className="signup-tabs">
          <button
            className={selectedTab === 'applicant' ? 'active' : ''}
            onClick={() => setSelectedTab('applicant')}
          >
            개인회원
          </button>
          <button
            className={selectedTab === 'company' ? 'active' : ''}
            onClick={() => setSelectedTab('company')}
          >
            기업회원
          </button>
        </div>

        <div className="signup-divider" />

        <p className="signup-subtext">소셜 계정으로 간편 로그인</p>

        <div className="signup-icons">
          <img src="/icons/naver.svg" alt="naver" />
          <img src="/icons/kakao.svg" alt="kakao" />
          <img src="/icons/google.svg" alt="google" />
          <img src="/icons/facebook.svg" alt="facebook" />
          <img src="/icons/apple.svg" alt="apple" />
        </div>

        <button className="signup-id-button" onClick={handleSignupClick}>
          ZOOP 통합 아이디 만들기
        </button>

        <p className="signup-footer">
          이미 계정이 있나요? <a href="/login">로그인</a>
        </p>
      </div>
    </>
  );
}

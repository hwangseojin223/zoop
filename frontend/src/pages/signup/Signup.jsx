import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import SEO from '../../components/SEO';
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
      {/* SEO 컴포넌트 */}
      <SEO
        title="회원가입 - ZOOP | AI 기반 채용 플랫폼"
        description="ZOOP에 회원가입하여 AI 기반 채용 서비스를 시작하세요. 개발자와 기업 모두를 위한 맞춤형 채용 솔루션을 제공합니다."
        keywords="ZOOP 회원가입, AI채용가입, 개발자회원가입, 기업회원가입, 채용플랫폼가입"
        image="/signup-banner.jpg"
        url="https://zoop.com/auth/signup"
        type="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "ZOOP 회원가입",
          "description": "AI 기반 채용 플랫폼 ZOOP 회원가입 페이지",
          "url": "https://zoop.com/auth/signup"
        }}
      />

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

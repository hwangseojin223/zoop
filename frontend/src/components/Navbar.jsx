import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // CSS 파일은 네가 이미 설정한 대로 유지

const Navbar = () => {
  return (
    <header className="zoop-navbar">
      <Link to="/">
        <img src="/logo_zoop.png" alt="logo" className="logo-img" />
      </Link>

      <nav className="nav-links">
        <a href="#">회사 소개</a>
        <a href="#">공지사항</a>
        <a href="#">고객센터</a>
        <a href="#">자주 묻는 질문</a>
        <a href="#">채용</a>
      </nav>

      <div className="auth-buttons">
        <Link to="/auth/applicant/signup">
          <button className="btn-outline">회원가입</button>
        </Link>
        <Link to="/auth/login">
          <button className="btn-filled">로그인</button>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;

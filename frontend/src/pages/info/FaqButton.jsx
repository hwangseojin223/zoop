import React from 'react';
import { Link } from 'react-router-dom';
import './FaqButton.css';

const FaqButton = () => {
  return (
    <div className="faq-button-container">
      <Link to="/faq" className="nav-link">
        자주 묻는 질문
      </Link>
    </div>
  );
};

export default FaqButton;

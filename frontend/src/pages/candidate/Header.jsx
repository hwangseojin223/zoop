import React from 'react';
import './Header.css';

function Header() {
  return (
    <div className="header">
      <div className="header-left">
        {/* Placeholder for menu icon if needed */}
      </div>
      <div className="header-right">
        <span className="header-icon">🔔</span> {/* Notification icon */}
        <span className="header-icon">✉️</span> {/* Message icon */}
        <span className="header-icon">💬</span> {/* Chat icon */}
        <div className="user-profile">
          <span>아이디</span>
          <img src="../../person.png" alt="User Avatar" className="user-avatar" /> {/* Replace with actual avatar */}
        </div>
      </div>
    </div>
  );
}

export default Header;
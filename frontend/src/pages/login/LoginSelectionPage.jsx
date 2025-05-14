import React, { useEffect, useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './LoginSelectionPage.css';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

function LoginSelectionPage() {
  const [userType, setUserType] = useState('candidate'); // 기본값 개인회원
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberId, setRememberId] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  const navigate = useNavigate();
  const { setAuthState } = useAuth();

  useEffect(() => {
    const savedId = localStorage.getItem('savedLoginId');
    const savedType = localStorage.getItem('savedUserType');

    if (savedId && savedType) {
      setLoginId(savedId);
      setUserType(savedType);
      setRememberId(true);
    }
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!loginId || !password) {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    // ✅ 현재는 기업회원만 로그인 허용
    // if (userType !== 'company') {
    //   setError('현재는 기업회원만 로그인할 수 있습니다.');
    //   return;
    // }

    setError('');

    try {
      const response = await axios.post('http://localhost:8081/api/auth/login', {
        loginId,
        password,
        userType
      });

      const jwtToken = response.data.token;
      const receivedUserType = response.data.userType;
      const receivedUserId = response.data.userId;
      const receivedLoginId = response.data.loginId; 

      if (jwtToken) {
        setAuthState({
          token: jwtToken,
          userType: receivedUserType,
          userId: receivedUserId,
          loginId: receivedLoginId,
        });

        localStorage.setItem('jwtToken', jwtToken);
        localStorage.setItem('userType', receivedUserType);
        localStorage.setItem('userId', receivedUserId);
        localStorage.setItem('loginId', receivedLoginId);

        if (rememberId) {
          localStorage.setItem('savedLoginId', loginId);
          localStorage.setItem('savedUserType', userType);
        } else {
          localStorage.removeItem('savedLoginId');
          localStorage.removeItem('savedUserType');
        }

        alert('로그인 성공!');
        if(receivedUserType === 'candidate'){
          // ✅ 기업회원 전용 페이지로 이동
          navigate('/candidate/dashboard');
        }else if(receivedUserType === 'company'){
          navigate('/company/dashboard');
        }
       
      } else {
        setError('로그인은 성공했으나 인증 토큰을 받지 못했습니다.');
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : '로그인 중 오류가 발생했습니다.')
      );
    }
  };

  return (
    <>
      <Navbar />
      <div className="login-page-wrapper">
        <div className="login-container">
          <div className="login-left">
            <h2>다양한 ZOOP 서비스를 로그인 한 번으로 편리하게 이용하세요.</h2>
            <div className="zoop-logo">
              <img
                src="/logo_zoop.png"
                alt="logo"
                className="logo-img"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/')}
              />
            </div>
            <button type="button" className="signup-button" onClick={() => navigate('/auth/individual/signup')}>
              개인 통합회원 가입
            </button>
          </div>

          <div className="login-right">
            <div className="login-tabs">
              <button
                type="button"
                className={`tab-button ${userType === 'candidate' ? 'active' : ''}`}
                onClick={() => setUserType('candidate')}
              >
                개인회원
              </button>
              <button
                type="button"
                className={`tab-button ${userType === 'company' ? 'active' : ''}`}
                onClick={() => setUserType('company')}
              >
                기업회원
              </button>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="input-group">
                <input
                  type="text"
                  id="loginId"
                  placeholder="아이디"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="password"
                  id="password"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* ✅ 체크박스 라벨 두 개를 감싸는 div 추가 */}
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberId}
                    onChange={(e) => setRememberId(e.target.checked)}
                  />
                  아이디 저장
                </label>
                <label className="checkbox-label"> {/* 인라인 스타일 제거 */}
                  <input
                    type="checkbox"
                    checked={keepLoggedIn}
                    onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  />
                  로그인 유지
                </label>
              </div> {/* ✅ div 종료 태그 */}


              <button type="submit" className="login-button">로그인</button>

              {error && <p className="error-message" style={{ marginBottom: '20px', textAlign: 'center' }}>{error}</p>}

              <div className="find-links">
                <Link to="/find-id">아이디 찾기</Link>
                <span>|</span>
                <Link to="/find-password">비밀번호 찾기</Link>
              </div>
            </form>

            <div className="social-login">
              <p>소셜 계정으로 간편 로그인</p>
              <div className="social-icons">
                <a href="#" className="social-icon naver">N</a>
                <a href="#" className="social-icon google">G</a>
                <a href="#" className="social-icon github">G</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginSelectionPage;
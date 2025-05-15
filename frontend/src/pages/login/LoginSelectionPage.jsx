import React, { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from 'react-router-dom'; 
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
  const [searchParams] = useSearchParams(); // URL 쿼리 파라미터를 읽기 위한 훅 (소셜 로그인 에러 확인 등)

  const socialConfig = {
    google: {
      // .env 파일에서 REACT_APP_GOOGLE_CLIENT_ID 환경 변수 값을 불러옴
      clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
       // .env 파일에서 REACT_APP_GOOGLE_REDIRECT_URI 환경 변수 값을 불러오거나 기본값 사용
      redirectUri: process.env.REACT_APP_GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/social/google/callback', // Google Cloud Console에 등록된 프론트엔드 콜백 URI
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth', // Google 인증 요청 엔드포인트
      scope: 'email profile openid', // 요청할 권한 범위 (사용자 이메일, 프로필, 고유 ID)
      responseType: 'code', // OAuth 2.0 인가 코드 방식 사용
      accessType: 'offline', // 리프레시 토큰 발급 요청 (선택 사항, 자동 로그인 등에 활용)
       // prompt: 'consent', // 동의 화면 항상 표시 (개발 또는 테스트 시 유용)
    }
  };

  useEffect(() => {
    const savedId = localStorage.getItem('savedLoginId');
    const savedType = localStorage.getItem('savedUserType');

    if (savedId && savedType) {
      setLoginId(savedId);
      setUserType(savedType);
      setRememberId(true);
    }

    // ✅ 2. URL 쿼리 파라미터에서 소셜 로그인 콜백 후 전달된 에러 정보 확인 및 표시
    // SocialLoginCallback 컴포넌트 등에서 navigate(`/auth/login?error=...`) 형태로 에러를 전달했을 때 처리
    const authError = searchParams.get('error');
    if (authError) {
        // URL 디코딩하여 에러 메시지 상태에 저장
        // 에러 메시지는 사용자에게 보여줄 적절한 형태로 가공하는 것이 좋습니다.
        setError(`로그인 처리 중 오류 발생: ${decodeURIComponent(authError)}`);
        // 에러 정보가 표시된 후에는 URL에서 해당 파라미터를 제거하여 새로고침 시 중복 표시 방지
        // navigate 함수에 { replace: true } 옵션을 사용하여 현재 히스토리 항목을 대체합니다.
        navigate(window.location.pathname, { replace: true }); // 현재 경로로 이동하며 기록 대체
    }

     // TODO: Google PKCE (Proof Key for Code Exchange) 관련 코드 검증 및 삭제 로직 추가
     // PKCE는 모바일/SPA 환경에서 Authorization Code Grant Flow를 안전하게 만드는 확장입니다.
     // 콜백 페이지에서 검증하고 삭제하는 것이 일반적이지만, 여기에서도 필요시 정리할 수 있습니다.
     // const pkceVerifier = sessionStorage.getItem('pkce_code_verifier');
     // if (pkceVerifier) {
     //     // 백엔드에 verifier를 보내 검증했거나, 검증이 필요 없어진 경우 삭제
     //     sessionStorage.removeItem('pkce_code_verifier');
     // }


  }, [searchParams, navigate]); // searchParams와 navigate가 변경될 때마다 이 Effect 재실행 (주소창 URL 변화 감지)

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
      // 3. 백엔드 응답 처리
      // 응답 데이터에서 필요한 정보(JWT 토큰, 사용자 ID, 유형, 로그인 ID) 추출
      // const { token, userId, userType: receivedUserType, loginId: receivedLoginId } = response.data;
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
          navigate('/candidate/dashboard', { replace: true });
        }else if(receivedUserType === 'company'){
          navigate('/company/dashboard', { replace: true });
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
  // == 소셜 로그인 시작 관련 헬퍼 함수 ==

  // CSRF 방지를 위한 랜덤 state 문자열 생성 함수 (Naver, GitHub 등에서 사용)
  // OAuth 2.0 명세에 따라 16자 이상의 충분히 무작위적인 문자열을 권장합니다.
  const generateRandomString = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < 20; i++) { // 20자 길이의 랜덤 문자열 생성
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

   // TODO: Google PKCE (Proof Key for Code Exchange) 구현을 위한 code_verifier 및 code_challenge 생성 함수
   // PKCE는 SPA나 모바일 앱과 같이 클라이언트 시크릿을 안전하게 저장하기 어려운 환경에서
   // 인가 코드 가로채기 공격(Authorization Code Injection)을 방지하기 위한 보안 확장입니다.
   // Google OAuth 2.0 사용 시 강력 권장됩니다. (RFC 7636 참고)
   /*
   const generatePkcePair = async () => {
        // RFC 7636에 따라 code_verifier (랜덤 문자열) 생성 (43~128자의 안전한 랜덤 문자열)
        const verifier = generateRandomString(64); // 예: 64자 생성

        // code_verifier를 SHA-256 해시한 후 Base64 URL 인코딩하여 code_challenge 생성 (RFC 4648 Section 5)
        const encoder = new TextEncoder();
        const data = encoder.encode(verifier);
        const hash = await crypto.subtle.digest('SHA-256', data);
        const challenge = base64UrlEncode(hash); // ArrayBuffer를 Base64 URL 인코딩하는 함수 필요

        sessionStorage.setItem('pkce_code_verifier', verifier); // verifier를 세션 스토리지에 저장 (콜백 페이지에서 사용)

        return { verifier, challenge };
    };

    // ArrayBuffer를 Base64 URL 인코딩하는 헬퍼 함수 (URL-safe 문자 사용, 패딩 제거)
    const base64UrlEncode = (buffer) => {
         return btoa(String.fromCharCode(...new Uint8Array(buffer)))
            .replace(/\+/g, '-') // +를 -로
            .replace(/\//g, '_') // /를 _로
            .replace(/=+$/, ''); // = 패딩 제거
    };
   */


  // ✅ == 소셜 로그인 시작 핸들러 ==
  // 사용자가 소셜 로그인 버튼을 클릭했을 때 해당 소셜 서비스의 인증 페이지로 브라우저를 리다이렉트시키는 함수
  const handleSocialLogin = (provider) => {
    // 1. 클릭된 provider에 해당하는 설정 정보 가져오기
    const config = socialConfig[provider];
    // 필수 설정 정보 누락 확인
    if (!config || !config.clientId || !config.redirectUri || !config.authUrl) {
      console.error('소셜 로그인 설정 정보가 누락되었습니다:', provider, config);
      setError(`소셜 로그인 설정 오류가 발생했습니다 (${provider}). .env 파일을 확인해주세요.`); // 사용자에게 오류 표시
      return; // 함수 실행 중단
    }

    let authUrl = ''; // 구성할 인증 요청 URL 변수
    // 2. 각 제공자(Naver, Google, GitHub)별 OAuth 2.0/OpenID Connect 인증 요청 URL 형식에 맞춰 파라미터를 구성
    // 모든 파라미터 값 (특히 redirect_uri, scope 등)은 encodeURIComponent()를 사용하여 URI 인코딩해야 안전합니다.
    if (provider === 'naver') {
      // Naver OAuth 2.0 인증 요청 URL 구성 예시
      const state = generateRandomString(); // CSRF 방지용 state 값 생성
      sessionStorage.setItem('oauth_state', state); // 생성된 state 값을 세션 스토리지에 저장 (콜백 페이지에서 검증)
      authUrl = `${config.authUrl}?response_type=code&client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&state=${state}`;
    } else if (provider === 'google') {
       // Google OAuth 2.0 / OpenID Connect 인증 요청 URL 구성 예시
       authUrl = `${config.authUrl}?response_type=${config.responseType}&client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&scope=${encodeURIComponent(config.scope)}`;
       // 추가 파라미터 (예: access_type=offline, prompt=consent 등)
       if (config.accessType) authUrl += `&access_type=${config.accessType}`;
       if (config.prompt) authUrl += `&prompt=${config.prompt}`;

       // TODO: Google PKCE (Proof Key for Code Exchange) 구현을 위한 파라미터 추가를 강력 권장
       // const { verifier, challenge } = await generatePkcePair(); // generatePkcePair 함수가 async일 경우 handleSocialLogin도 async로 변경 필요
       // authUrl += `&code_challenge=${challenge}&code_challenge_method=S256`; // 보통 S256 사용
       // PKCE 사용 시에도 state 파라미터를 CSRF 방지용으로 포함할 수 있습니다: authUrl += `&state=${generateRandomString()}`;

    } else if (provider === 'github') {
        // GitHub OAuth Apps 인증 요청 URL 구성 예시
        const state = generateRandomString(); // CSRF 방지용 state 값 생성
         sessionStorage.setItem('oauth_state', state); // 생성된 state 값을 세션 스토리지에 저장 (콜백 페이지에서 검증)
        authUrl = `${config.authUrl}?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&scope=${encodeURIComponent(config.scope)}`;
         // GitHub도 state 파라미터 지원: authUrl += `&state=${state}`; // 필요시 state 포함

    } else {
        // socialConfig에 정의되지 않은 provider 이름이 handleSocialLogin 함수로 넘어온 경우
        console.error('지원하지 않는 소셜 로그인 제공자:', provider);
        setError(`지원하지 않는 소셜 로그인입니다 (${provider}).`);
        return;
    }

    // 3. 구성된 인증 URL로 브라우저를 리다이렉트
    if (authUrl) {
        console.log(`소셜 로그인 시작 - ${provider} 인증 URL:`, authUrl);
        // window.location.href를 사용하여 브라우저의 현재 페이지를 변경합니다.
      window.location.href = authUrl;
    } else {
        // authUrl 생성이 실패한 경우 (설정 오류 등)
        console.error('소셜 로그인 인증 URL 생성 중 오류 발생');
        setError('소셜 로그인 URL 생성 중 오류가 발생했습니다.');
    }
  };


  // == 컴포넌트 렌더링 부분 (JSX) ==

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

              {error && <p className="error-message" style={{ marginBottom: '10px', textAlign: 'center' }}>{error}</p>}

              <div className="find-links">
                <Link to="/find-id">아이디 찾기</Link>
                <span>|</span>
                <Link to="/find-password">비밀번호 찾기</Link>
              </div>
            </form>
            <div className="signup-divider" />
            <div className="social-login">
              <p className="signup-subtext">소셜 계정으로 간편 로그인</p> {/* 첫 번째 스니펫의 p 태그 클래스 이름 사용 */}
              <div className="social-icons">
                {/* 네이버 아이콘 */}
                <img src="/icons/naver.svg" alt="네이버 로그인" className="social-icon" /> {/* 첫 번째 스니펫의 이미지 소스 사용, 클래스 이름 social-icon 추가 */}
                {/* 카카오 아이콘 */}
                <img src="/icons/kakao.svg" alt="카카오 로그인" className="social-icon" /> {/* 첫 번째 스니펫의 이미지 소스 사용 */}
                {/* 구글 아이콘 (버튼으로 변경하고 클릭 핸들러 연결) */}
                <button type="button" className="social-icon google" onClick={() => handleSocialLogin('google')}> {/* 버튼 태그 사용 및 클래스, onClick 핸들러 연결 */}
                  <img src="/icons/google.svg" alt="구글 로그인" /> {/* 구글 아이콘 이미지 사용 */}
                </button>
                {/* 페이스북 아이콘 */}
                <img src="/icons/facebook.svg" alt="페이스북 로그인" className="social-icon" /> {/* 첫 번째 스니펫의 이미지 소스 사용 */}
                {/* 애플 아이콘 */}
                <img src="/icons/apple.svg" alt="애플 로그인" className="social-icon" /> {/* 첫 번째 스니펫의 이미지 소스 사용 */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginSelectionPage;
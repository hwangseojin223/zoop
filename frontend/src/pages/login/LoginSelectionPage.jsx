import React, { useEffect, useState } from "react"; // React, useEffect, useState 훅 임포트
import { useNavigate, Link } from 'react-router-dom'; // 라우팅을 위한 useNavigate, Link 임포트
import axios from 'axios'; // 백엔드 API 호출을 위한 axios 임포트

import './LoginSelectionPage.css'; // 이 컴포넌트의 스타일을 위한 CSS 파일 임포트 (아래 제공된 CSS 코드를 여기에 넣습니다)
import { useAuth } from '../../context/AuthContext';
/**
 * 개인/기업 회원 유형을 선택하고 로그인 정보를 입력하는 페이지 컴포넌트입니다.
 * 백엔드 로그인 API (/api/auth/login)를 호출하는 기능을 포함합니다.
 * 제공된 HTML/CSS 디자인을 기반으로 UI를 구성합니다.
 */
function LoginSelectionPage() {

    // 사용자 유형 상태 관리: 'candidate' (개인), 'company' (기업), 또는 null
    // 페이지 로드 시 기본값으로 'candidate' (개인회원)을 선택합니다.
    const [userType, setUserType] = useState('candidate');

    // 로그인 폼 입력 값 상태 관리
    const [loginId, setLoginId] = useState(''); // 아이디 입력 필드 값
    const [password, setPassword] = useState(''); // 비밀번호 입력 필드 값

    // 오류 메시지 상태 관리
    const [error, setError] = useState(''); // 사용자에게 보여줄 오류 메시지

    // '아이디 저장' 및 '로그인 유지' 체크박스 상태 관리
    const [rememberId, setRememberId] = useState(false); // '아이디 저장' 체크박스 상태
    const [keepLoggedIn, setKeepLoggedIn] = useState(false); // '로그인 유지' 체크박스 상태

    // 페이지 이동을 위한 useNavigate 훅 사용
    const navigate = useNavigate();

    // 컴포넌트가 마운트될 때 (페이지 로드 시) 한 번 실행되는 효과 훅입니다.
    // '아이디 저장' 기능 구현을 위해 Local Storage에 저장된 아이디와 유형을 불러옵니다.
    useEffect(() => {
        const savedId = localStorage.getItem('savedLoginId'); // Local Storage에서 저장된 아이디 불러오기
        const savedType = localStorage.getItem('savedUserType'); // Local Storage에서 저장된 유형 불러오기 ('candidate' 또는 'company')

        // 저장된 아이디와 유형이 모두 존재하면 상태를 업데이트합니다.
        if (savedId && savedType) {
            console.log('저장된 아이디 불러옴:', savedId, savedType); // 디버깅을 위한 콘솔 로그
            setLoginId(savedId); // 불러온 아이디로 loginId 상태 설정
            setUserType(savedType); // 불러온 유형으로 userType 상태 설정 (기본값 'candidate'보다 우선)
            setRememberId(true); // '아이디 저장' 체크박스를 자동으로 체크 상태로 만듭니다.

            // TODO: 만약 '로그인 유지' 상태도 Local Storage에 저장했다면 여기서 불러와서 setKeepLoggedIn(true) 할 수 있습니다.
            // const savedKeepLoggedIn = localStorage.getItem('savedKeepLoggedIn');
            // if (savedKeepLoggedIn === 'true') {
            //     setKeepLoggedIn(true);
            // }

        } else {
             // 저장된 아이디가 없다면, userType 상태는 초기값인 'candidate'를 유지합니다.
             // useEffect 외부에서 이미 'candidate'로 초기화되었으므로 이 else 블록의 로그는 초기 상태를 보여줍니다.
            console.log('저장된 아이디 없음. 기본값:', userType); // 디버깅을 위한 콘솔 로그
        }
        // 의존성 배열이 비어 있으므로 ( []), 이 useEffect는 컴포넌트가 처음 렌더링될 때 (마운트 시) 한 번만 실행됩니다.
    }, []);


    /**
     * 로그인 버튼 클릭 시 실행되는 함수입니다.
     * 폼 제출 이벤트를 처리하고 백엔드 로그인 API를 호출합니다.
     * @param {object} event - 폼 제출 이벤트 객체
     */
    const handleLogin = async (event) => {
        event.preventDefault(); // 폼의 기본 제출 동작(페이지 새로고침)을 막습니다.

        // 기본값 설정('candidate')으로 인해 userType이 null일 가능성은 낮지만, 혹시 모를 경우를 대비한 유효성 검사입니다.
        if (userType === null) {
            setError('로그인 유형 (개인/기업)을 선택해주세요.'); // 오류 메시지 설정
            console.log('Login attempt failed: userType is null'); // 디버깅 로그
            return; // 함수 실행 중단
        }

        // 아이디 또는 비밀번호 필드가 비어 있는지 확인합니다.
        if (!loginId || !password) {
            setError('아이디와 비밀번호를 입력해주세요.'); // 오류 메시지 설정
            console.log('Login attempt failed: ID or Password missing'); // 디버깅 로그
            return; // 함수 실행 중단
        }

        setError(''); // 이전 오류 메시지를 초기화합니다.
        console.log('로그인 시도:', { loginId, userType, rememberId, keepLoggedIn }); // 백엔드로 보낼 데이터 및 체크박스 상태 디버깅 로그

        try {
            // 백엔드 로그인 API 엔드포인트로 HTTP POST 요청을 보냅니다.
            // 'http://localhost:8080'은 백엔드 서버 주소, '/api/auth/login'은 백엔드의 AuthController에 매핑된 경로입니다.
            const response = await axios.post('http://localhost:8081/api/auth/login', {
                loginId: loginId, // 사용자가 입력한 아이디
                password: password, // 사용자가 입력한 비밀번호
                userType: userType, // 선택된 사용자 유형 ('candidate' 또는 'company')
                // TODO: '로그인 유지' 상태를 백엔드 API에 전달하여 토큰 만료 시간 설정 등에 활용해야 한다면 이 필드를 추가합니다.
                // keepLoggedIn: keepLoggedIn
            });

            console.log('로그인 성공 응답:', response.data); // 성공 응답 데이터 콘솔 출력

            // 백엔드에서 받은 응답 데이터에서 JWT 토큰, 사용자 유형, 사용자 ID를 추출합니다. (LoginResponse DTO 구조에 맞춰)
            const jwtToken = response.data.token;
            const receivedUserType = response.data.userType;
            const receivedUserId = response.data.userId;

            // JWT 토큰이 유효하게 발급된 경우에만 처리합니다.
            if (jwtToken) {
                 // JWT 토큰과 사용자 정보를 Local Storage에 저장합니다.
                 // Local Storage는 브라우저에 데이터를 영구적으로 저장하며, 페이지 새로고침 시에도 유지됩니다.
                 localStorage.setItem('jwtToken', jwtToken); // 인증 토큰 저장
                 localStorage.setItem('userType', receivedUserType); // 로그인한 사용자 유형 저장 (로그인 후 페이지에서 사용될 수 있음)
                 localStorage.setItem('userId', receivedUserId); // 로그인한 사용자 ID 저장

                // '아이디 저장' 기능 구현: rememberId 상태가 true이면 Local Storage에 아이디와 유형을 저장합니다.
                if (rememberId) {
                    localStorage.setItem('savedLoginId', loginId); // 사용자가 입력한 아이디 저장
                    localStorage.setItem('savedUserType', userType); // 아이디가 저장된 사용자 유형 저장 (다음에 페이지 로드 시 불러와서 유형 자동 선택에 사용)
                    // TODO: '로그인 유지' 상태도 Local Storage에 저장해야 한다면 (예: 다음에 페이지 로드 시 체크 상태 유지)
                    // localStorage.setItem('savedKeepLoggedIn', keepLoggedIn.toString()); // boolean은 문자열로 저장
                } else {
                    // '아이디 저장' 선택을 해제한 경우, Local Storage에 저장된 아이디와 유형을 삭제합니다.
                    localStorage.removeItem('savedLoginId');
                    localStorage.removeItem('savedUserType');
                    // localStorage.removeItem('savedKeepLoggedIn'); // 함께 삭제
                }

                // TODO: '로그인 유지' 기능은 백엔드에서 토큰 만료 시간을 길게 설정하는 방식으로 구현해야 합니다. 클라이언트는 그저 keepLoggedIn 상태를 백엔드로 전달합니다.

                alert('로그인 성공!'); // 사용자에게 알림 메시지 표시
                // TODO: 로그인 성공 후 이동할 실제 메인 페이지 경로로 변경합니다.
                navigate('/'); // '/' 경로는 예시이며, 실제 대시보드 등으로 변경 필요합니다.

            } else {
                 // 백엔드에서 성공 응답(200 OK)을 보냈지만 응답 본문에 토큰이 없는 경우 (백엔드 문제일 수 있습니다)
                 setError('로그인은 성공했으나 인증 토큰을 받지 못했습니다. 백엔드 응답 확인 필요.'); // 오류 메시지 설정
                 console.error('Login successful, but no token received:', response.data); // 상세 오류 콘솔 출력
            }

        } catch (err) {
            // API 호출 중 오류가 발생한 경우 (HTTP 상태 코드 4xx, 5xx 등)
            console.error('로그인 실패:', err.response ? err.response.data : err.message); // 상세 오류 콘솔 출력 (응답 데이터 또는 메시지)
            // 백엔드에서 보낸 오류 메시지(예: 예외 메시지)를 사용자에게 보여줍니다.
            // err.response.data가 객체이고 message 필드를 포함하는 경우 해당 메시지를 사용하고, 그렇지 않으면 일반 오류 메시지를 사용합니다.
            setError(err.response && err.response.data && typeof err.response.data === 'object' && err.response.data.message ? err.response.data.message : (err.response && typeof err.response.data === 'string' ? err.response.data : '로그인 중 오류가 발생했습니다.')); // 오류 메시지 파싱 개선
        }
    };

    // --- JSX (UI) 부분 ---
    // 이 컴포넌트가 화면에 어떻게 그려질지를 정의합니다. 제공된 HTML 구조 및 CSS 클래스를 반영합니다.
    return (
         // 최상위 컨테이너: login-container 클래스 적용
        <div className="login-container">
            {/* 왼쪽 패널: login-left 클래스 적용 */}
            <div className="login-left">
                <h2>다양한 ZOOP 서비스를 로그인 한 번으로 편리하게 이용하세요.</h2>
                {/* 로고 영역: zoop-logo 클래스 적용 */}
                <div className="zoop-logo">
                     {/* 이미지 태그: src 경로를 실제 이미지 파일 위치로 수정해야 합니다. */}
                     <img
                        src="/logo_zoop.png"
                        alt="logo"
                        className="logo-img"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate('/')}
                        />
                </div>
                {/* 개인 통합회원 가입 버튼: signup-button 클래스 적용, onClick 이벤트로 페이지 이동 */}
                {/* TODO: 개인 회원가입 페이지 경로로 navigate 함수 호출 */}
                <button type="button" className="signup-button" onClick={() => navigate('/auth/individual/signup')}>
                    개인 통합회원 가입
                </button>
                 {/* TODO: 만약 기업 회원가입 버튼이나 선택 페이지로 이동하는 버튼이 필요하다면 여기에 추가 */}
            </div>

            {/* 오른쪽 패널: login-right 클래스 적용 */}
            <div className="login-right">
                {/* 사용자 유형 선택 탭: login-tabs 클래스 적용 */}
                <div className="login-tabs">
                    {/* 개인 회원 선택 탭 버튼: tab-button 클래스, userType 상태에 따라 active 클래스 동적 적용 */}
                    <button
                         type="button" // 폼 제출 방지
                        className={`tab-button ${userType === 'candidate' ? 'active' : ''}`}
                        onClick={() => setUserType('candidate')} // 클릭 시 userType 상태를 'candidate'로 업데이트
                    >
                        개인회원
                    </button>
                     {/* 기업 회원 선택 탭 버튼: tab-button 클래스, userType 상태에 따라 active 클래스 동적 적용 */}
                     <button
                         type="button" // 폼 제출 방지
                        className={`tab-button ${userType === 'company' ? 'active' : ''}`}
                        onClick={() => setUserType('company')} // 클릭 시 userType 상태를 'company'로 업데이트
                    >
                        기업회원
                    </button>
                </div>

                {/* 로그인 폼: login-form 클래스 적용, onSubmit 이벤트 핸들러 연결 */}
                {/* HTML 구조에 맞춰 login-right 안에 form을 배치합니다. */}
                <form onSubmit={handleLogin} className="login-form">
                    {/* 아이디 입력 필드 그룹: input-group 클래스 적용 */}
                     <div className="input-group">
                         {/* HTML에는 라벨 텍스트가 없지만, 접근성을 위해 라벨 유지 (CSS로 숨길 수 있음) */}
                         {/* <label htmlFor="loginId" style={{display: 'none'}}>아이디</label> */}
                         {/* input 필드: type="text", id="loginId", value는 loginId 상태, 변경 시 setLoginId로 상태 업데이트 */}
                         {/* placeholder 속성 추가 및 required 속성 유지 */}
                         <input
                            type="text"
                            id="loginId"
                            placeholder="아이디"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                            required // 필수 입력 필드
                        />
                     </div>
                    {/* 비밀번호 입력 필드 그룹: input-group 클래스 적용 */}
                     <div className="input-group">
                          {/* <label htmlFor="password" style={{display: 'none'}}>비밀번호</label> */}
                         {/* input 필드: type="password", id="password", value는 password 상태, 변경 시 setPassword로 상태 업데이트 */}
                         {/* placeholder 속성 추가 및 required 속성 유지 */}
                         <input
                            type="password"
                            id="password"
                            placeholder="비밀번호"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required // 필수 입력 필드
                        />
                     </div>

                    {/* 아이디 저장 및 로그인 유지 체크박스 그룹 */}
                    {/* HTML에는 각 체크박스 라벨에 checkbox-label 클래스가 적용되어 있습니다. */}
                    {/* 첫 번째 체크박스 라벨: checkbox-label 클래스 적용 */}
                    <label className="checkbox-label">
                         {/* input type="checkbox": checked는 rememberId 상태, 변경 시 setRememberId로 상태 업데이트 */}
                         <input
                            type="checkbox"
                            checked={rememberId}
                            onChange={(e) => setRememberId(e.target.checked)}
                        />
                         아이디 저장
                    </label>
                     {/* 두 번째 체크박스 라벨: checkbox-label 클래스 및 간격 조절 스타일 적용 */}
                    <label className="checkbox-label" style={{marginTop: '-15px', marginBottom: '20px'}}> {/* 간격 조절은 CSS에서 마진으로 처리 */}
                         {/* input type="checkbox": checked는 keepLoggedIn 상태, 변경 시 setKeepLoggedIn로 상태 업데이트 */}
                         <input
                            type="checkbox"
                            checked={keepLoggedIn}
                            onChange={(e) => setKeepLoggedIn(e.target.checked)}
                         />
                         로그인 유지
                    </label>


                    {/* 로그인 버튼: login-button 클래스 적용 */}
                    {/* type="submit"으로 설정하여 이 버튼 클릭 시 form의 onSubmit 이벤트 핸들러(handleLogin)를 실행하도록 합니다. */}
                     <button type="submit" className="login-button">로그인</button>

                    {/* 오류 메시지 표시 영역: error-message 클래스 적용 */}
                    {/* error 상태가 true (오류 메시지 문자열이 있을 때)이면 <p> 태그를 렌더링합니다. */}
                    {error && <p className="error-message" style={{marginBottom: '20px', textAlign: 'center'}}>{error}</p>} {/* 디자인에 맞춰 위치와 스타일 조정 필요 */}


                    {/* 아이디/비밀번호 찾기 링크 영역: find-links 클래스 적용 */}
                     <div className="find-links">
                        {/* Link 컴포넌트 사용 및 CSS 클래스 적용 */}
                        {/* TODO: 아이디 찾기 페이지의 실제 경로로 Link 컴포넌트의 'to' 속성을 수정합니다. */}
                        <Link to="/find-id">아이디 찾기</Link>
                        <span>|</span> {/* 구분자 */}
                        {/* TODO: 비밀번호 찾기 페이지의 실제 경로로 Link 컴포넌트의 'to' 속성을 수정합니다. */}
                        <Link to="/find-password">비밀번호 찾기</Link>
                    </div>
                </form> {/* form 태그 끝 */}


                {/* 소셜 간편 로그인 영역 (UI만 구성, 실제 기능 구현 필요): social-login 클래스 적용 */}
                {/* HTML 구조에 맞춰 form 태그 다음에 배치합니다. */}
                <div className="social-login">
                     <p>소셜 계정으로 간편 로그인</p>
                     {/* 소셜 로그인 버튼 그룹: social-icons 클래스 적용 */}
                     <div className="social-icons">
                        {/* 각 아이콘 링크: social-icon 클래스 및 소셜별 클래스 적용 */}
                        {/* HTML에서는 <a> 태그를 사용했습니다. onClick 이벤트 대신 href="#"를 사용하거나 실제 소셜 로그인 URL을 사용합니다. */}
                        {/* TODO: 실제 소셜 로그인 기능 구현 시 onClick 이벤트와 해당 로직 연결 필요 */}
                        <a href="#" className="social-icon naver">N</a>
                        <a href="#" className="social-icon google">G</a>
                        <a href="#" className="social-icon github">G</a>
                     </div>
                </div>

                 {/* 참고: HTML에는 login-left에 개인 회원가입 버튼이 있었습니다. login-right에는 별도 회원가입 링크가 없었습니다. */}
                 {/* 만약 login-right 하단에 별도의 회원가입 링크가 필요하다면 여기에 추가해야 합니다. */}

            </div> {/* login-right 끝 */}
            {/* login-container 끝 */}
        </div> 
    );
}

export default LoginSelectionPage; // 컴포넌트를 외부에서 사용할 수 있도록 내보냅니다.

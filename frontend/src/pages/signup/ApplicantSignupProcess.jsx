import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import './ApplicantSignupProcess.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../api/axios';


//export default는 그 함수를 다른 파일에서 import해서 사용할 수 있도록 내보내는 역할
export default function ApplicantSignupProcess() {
  const navigate = useNavigate();
  const { token } = useParams(); // URL 파라미터에서 토큰 가져오기
  
  // 초대 정보 상태
  const [invitationData, setInvitationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 초대 토큰으로 정보 조회
  useEffect(() => {
    const fetchInvitationData = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        // 1. 초대 토큰으로 정보 조회
        const invitationResponse = await axios.post(`/api/invitations/clicked/${token}`);
        const { githubLogin, isSignedUp } = invitationResponse.data;
        
        // 2. 이미 가입된 사용자인 경우 로그인 페이지로 이동
        if (isSignedUp) {
          navigate('/login', { 
            state: { 
              githubLogin: githubLogin,
              message: '이미 가입된 계정입니다. 로그인해주세요.' 
            } 
          });
          return;
        }
        
        // 3. 이메일 정보 조회
        try {
          const emailResponse = await axios.get(`/api/candidates/email/${githubLogin}`);
          const { email } = emailResponse.data;
          
          // 이메일 파싱 (아이디@도메인)
          const [emailId, domain] = email.split('@');
          setEmailLocal(emailId);
          setEmailDomain(domain);
          
          // 이메일이 자동으로 입력되었으므로 인증 완료 상태로 설정
          setIsEmailVerified(true);
        } catch (emailError) {
          console.log('이메일 정보를 찾을 수 없습니다:', emailError);
          // 이메일이 없어도 계속 진행
        }
        
        // 4. githubLogin을 아이디 입력란에 설정
        setInvitationData({ githubLogin });
        
      } catch (error) {
        console.error('초대 정보 조회 실패:', error);
        alert('초대 링크가 유효하지 않습니다.');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInvitationData();
  }, [token, navigate]);

//==================================================================================================
// 이메일 인증
//==================================================================================================

// 1. 상태 정의
const [emailLocal, setEmailLocal] = useState(''); // 이메일 아이디 부분 (ex. user@example.com 중 'user')
const [emailDomain, setEmailDomain] = useState(''); // 이메일 도메인 부분 (ex. 'example.com')
const [customInput, setCustomInput] = useState(false); // 사용자가 직접 도메인을 입력하는지 여부
const [verificationCode, setVerificationCode] = useState(''); // 입력받은 인증 코드
const [isEmailVerified, setIsEmailVerified] = useState(false); // 이메일 인증 완료 여부
const [codeSent, setCodeSent] = useState(false); // 인증 코드가 전송되었는지 여부
const [resendTimer, setResendTimer] = useState(300); // 재전송 타이머 (단위: 초, 기본 5분)
const [isSendingCode, setIsSendingCode] = useState(false); // 인증 코드 전송 중 여부 (버튼 비활성화용)
const [errorMessage, setErrorMessage] = useState(''); // 에러메시지지


/**
 * async : 비동기 함수를 명시할떄 사용, Promise를 반환한다. 
 * fetch : 네트워크 요청
 * await는 fetch가 완료될때까지 기다린다. 그 전에는 다른 코드가 실행되지 않는다.
 * encodeURIComponent : 안전한 형식으로 문자열을 인코딩(encoding)하는 내장함수
 */

// 2. 이메일 인증 코드 요청 함수
const handleSendCode = async () => {
  setIsSendingCode(true); // 전송 중 상태로 설정
  const fullEmail = `${emailLocal}@${emailDomain}`; // 전체 이메일 주소 조합
  const res = await fetch(`http://localhost:8081/api/email/send?email=${encodeURIComponent(fullEmail)}`, {
    method: 'POST',
  });

  if (res.ok) {
    alert('인증 코드가 전송되었습니다.');
    setCodeSent(true); // 코드 전송 성공 시 상태 변경
  } else {
    alert('코드 전송 실패');
  }
  setIsSendingCode(false); // 전송 종료
};

/**
 * useEffect는 리액트 함수형 컴포넌트에서 사이드 이펙트를 처리할 수 있게 도와주는 훅입니다. 
 * 사이드 이펙트란 컴포넌트 내에서 렌더링 외에 발생하는 모든 작업을 의미해요.
 *   첫 번째 인자로 사이드 이펙트 함수(콜백 함수)를 전달합니다.
 *   두 번째 인자로 의존성 배열을 전달할 수 있습니다. 이 배열 안에 들어있는 값들이 변경될 때마다 useEffect가 실행됩니다. 
 *   만약 배열이 비어 있다면, 컴포넌트가 마운트될 때 딱 한 번만 실행됩니다.
 */

// 3. 인증 코드 입력 후 타이머 작동
useEffect(() => {
  let timer;
  if (codeSent && !isEmailVerified && resendTimer > 0) {
    // 타이머 작동 조건: 코드 전송됨, 아직 인증되지 않음, 타이머 남아 있음.
    // 즉, codeSent=True, isEmailVerified=false이고, resendTimer > 0 일 때
    // set Interval(함수,  time) : time마다 함수를 한번씩 호출한다.
    timer = setInterval(() => {
      setResendTimer(prev => prev - 1); // 1초마다 타이머 감소
    }, 1000);
  }
  return () => clearInterval(timer); // 언마운트 또는 조건 해제 시 타이머 정리
}, [codeSent, resendTimer, isEmailVerified]);

// 4. 입력한 인증 코드 검증
const handleVerifyCode = async () => {
  const fullEmail = `${emailLocal}@${emailDomain}`; // 전체 이메일 주소
  const res = await fetch(`http://localhost:8081/api/email/verify?email=${encodeURIComponent(fullEmail)}&code=${verificationCode}`, {
    method: 'POST',
  });

  if (res.ok) {
    alert('이메일 인증 완료');
    setIsEmailVerified(true); // 인증 성공 시 상태 변경
  } else {
    alert('인증 실패. 코드를 확인해주세요.');
  }
};

// 5. 이메일 도메인 선택 변경 시 처리
const handleDomainChange = (e) => {
  const value = e.target.value;
  if (value === 'custom') {
    setCustomInput(true); // 직접 입력 모드로 전환
    setEmailDomain(''); // 도메인 초기화
  } else {
    setCustomInput(false); // 직접 입력 해제
    setEmailDomain(value); // 선택한 도메인으로 설정
  }
};

//6. 
  const handleResend = async () => {
    setCodeSent(false);
    setResendTimer(300);
    setVerificationCode('');
    await handleSendCode();
  };







  // 전체 동의 상태 관리
  const [allAgree, setAllAgree] = useState(false);

  // 개별 동의 상태 관리
  const [individualAgree, setIndividualAgree] = useState({
    terms: false,
    privacy: false,
    location: false,
    emailMarketing: false,
    smsMarketing: false,
  });

  //==================================================================================================
  // 전체 동의 체크박스를 클릭했을 때
  //==================================================================================================
  const handleAllAgreeChange = () => {
    const newAllAgree = !allAgree;
    setAllAgree(newAllAgree);

    // 모든 개별 동의 항목도 동일하게 설정
    setIndividualAgree({
      terms: newAllAgree,
      privacy: newAllAgree,
      location: newAllAgree,
      emailMarketing: newAllAgree,
      smsMarketing: newAllAgree,
    });
  };
  //==================================================================================================
  // 개별 동의 체크박스를 클릭했을 때
  //==================================================================================================
  const handleIndividualAgreeChange = (event) => {
    const { name, checked } = event.target;
    setIndividualAgree((prev) => {
      const newIndividualAgree = { ...prev, [name]: checked };
      // 개별 항목들이 모두 체크되었으면 전체 동의도 체크
      setAllAgree(Object.values(newIndividualAgree).every(Boolean));
      return newIndividualAgree;
    });
  };

  //==================================================================================================
  // 가입하기 버튼 클릭했을 때
  //==================================================================================================
  const handleSubmit = async (event) => {
    event.preventDefault(); // 기본 form 제출 방지

    //이메일 인증이 안되어있을 때때
    if (!isEmailVerified) {
      setErrorMessage('이메일 인증이 필요합니다.');
      return;
    }

    //키 값이 JPA ENTITY 객체의 프로퍼티와 일치해야한다.
    const formData = {
      githubLogin : document.getElementById('candidate_id').value,
      candidatePassword : document.getElementById('password').value,
      candidatePhoneNumber : document.getElementById('phone').value,
      candidateName : document.getElementById('candidate_name').value,
      candidateEmail : `${emailLocal}@${emailDomain}`,
      candidateRegistrationDate: new Date().toISOString(),  // 현재 시각
      candidateCreatedAt: new Date().toISOString(),        // 현재 시각
      candidateUpdatedAt: new Date().toISOString(),        // 현재 시각
    };

    try {

      const response = await fetch('http://localhost:8081/api/candidates/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        navigate('/auth/applicant/signup/success');
        // 원한다면 페이지 이동: window.location.href = '/welcome';
      } else {
        alert('회원가입 실패');
      }
    } catch (error) {
      console.error('오류 발생:', error);
      alert('서버 오류');
    }
  };


  return (
    <>
      <Navbar />
      <div className="applicant-signup-container">
        <h2>ZOOP 통합 개인회원 가입</h2>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>초대 정보를 불러오는 중...</p>
          </div>
        ) : (
        <form onSubmit={handleSubmit}>
          <div className="applicant-signup-form-group">
            <label htmlFor="candidate_id" className="applicant-signup-label">아이디</label>
            <input 
              type="text" 
              id="candidate_id" 
              name="candidate_id" 
              className="applicant-signup-input" 
              placeholder="4~20자리/영문, 숫자, 특수문자 '_'사용 가능"
              defaultValue={invitationData?.githubLogin || ''}
              readOnly={!!invitationData?.githubLogin}
              style={{
                backgroundColor: invitationData?.githubLogin ? '#f5f5f5' : 'white',
                color: '#333'
              }}
            />
          </div>

          <div className="applicant-signup-form-group">
            <label htmlFor="password" className="applicant-signup-label">비밀번호</label>
            <input type="password" id="password" name="password" className="applicant-signup-input" placeholder="8~16자리/영문 대소문자, 숫자, 특수문자 조합" />
          </div>

          <div className="applicant-signup-form-group">
            <label htmlFor="candidate_name" className="applicant-signup-label">이름</label>
            <input type="text" id="candidate_name" name="candidate_name" className="applicant-signup-input" placeholder="이름을 입력해주세요" />
          </div>

          <div className="applicant-signup-form-group">
            <label htmlFor="phone" className="applicant-signup-label">휴대폰</label>
            <div>
              <input type="text" id="phone" name="phone" className="applicant-signup-input" placeholder="하이픈(-) 제외" />
              <label className="applicant-signup-label">
                <input type="checkbox" name="overseas" /> 해외 거주 중이에요
              </label>
            </div>
          </div>

          {/* <button type="button" className="applicant-signup-button">인증요청</button>

          <div className="applicant-signup-form-group">
            <label htmlFor="email" className="applicant-signup-label">이메일</label>
            <input type="email" id="email" name="email" className="applicant-signup-input" defaultValue="email@saramin.co.kr" />
            <small className="applicant-signup-info-icon">ⓘ 취업에 관련된 정보를 받을 때 필요해요</small>
          </div> */}

          <div className="applicant-signup-form-group">
              <label>이메일</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="이메일 아이디"
                  value={emailLocal}
                  onChange={(e) => setEmailLocal(e.target.value)}
                  disabled={isEmailVerified}
                  style={{
                    flex: 1,
                    backgroundColor: isEmailVerified ? '#f5f5f5' : 'white',
                    color: '#333'
                  }}
                />
                <span>@</span>
                {customInput ? (
                  <input
                    type="text"
                    className="applicant-signup-input"
                    placeholder="도메인 입력"
                    value={emailDomain}
                    onChange={(e) => setEmailDomain(e.target.value)}
                    disabled={isEmailVerified}
                    style={{
                      flex: 1,
                      backgroundColor: isEmailVerified ? '#f5f5f5' : 'white',
                      color: '#333'
                    }}
                  />
                ) : (
                  <select
                    className="applicant-signup-input"
                    value={emailDomain}
                    onChange={handleDomainChange}
                    disabled={isEmailVerified}
                    style={{
                      flex: 1,
                      backgroundColor: isEmailVerified ? '#f5f5f5' : 'white',
                      color: '#333'
                    }}
                  >
                    <option value="">선택</option>
                    <option value="naver.com">naver.com</option>
                    <option value="gmail.com">gmail.com</option>
                    <option value="daum.net">daum.net</option>
                    <option value="custom">직접 입력</option>
                  </select>
                )}
              </div>
            </div>

            <div className="applicant-signup-form-group">
              <label>인증코드 입력</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  className="applicant-signup-input"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="6자리 인증코드"
                  disabled={!codeSent || isEmailVerified}
                  style={{
                    width: '100%',
                    backgroundColor: !codeSent || isEmailVerified ? '#f0f0f0' : 'white',
                    cursor: !codeSent || isEmailVerified ? 'not-allowed' : 'text'
                  }}
                />
                <button
                type="button"
                className="submit-button"
                onClick={codeSent ? handleVerifyCode : handleSendCode}
                style={{
                    backgroundColor: '#2dc997',
                    fontSize: '0.85rem',
                    padding: '0.4rem 0.8rem',
                    width: '160px',
                    height: '40px',
                    cursor: 'pointer'
                }}
                >
                {isSendingCode ? '전송 중...' : codeSent ? '확인' : '인증코드 받기'}
                </button>
              </div>
              {codeSent && !isEmailVerified && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#777' }}>
                  남은 시간: {Math.floor(resendTimer / 60)}:{String(resendTimer % 60).padStart(2, '0')}
                  {resendTimer === 0 && (
                    <button
                      onClick={handleResend}
                      type="button"
                      style={{ marginLeft: '1rem', border: 'none', background: 'none', color: '#2dc997', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      다시 보내기
                    </button>
                  )}
                </div>
              )}
            </div>
            {/* {errorMessage && <p style={{ color: 'red', marginTop: '0.5rem' }}>{errorMessage}</p>} */}

          <div className="applicant-signup-agreement">
            <label className="applicant-signup-label">
              <input 
                type="checkbox"  
                id="all-agree"
                checked={allAgree}
                onChange={handleAllAgreeChange}
              /> 
              전체 동의
              <p className="applicant-signup-optional">
                (필수) 개인회원 약관 동의, (필수) 개인정보 수집 및 이용에 동의를 포함합니다.
              </p>
            </label>

            <div className="applicant-signup-checkbox-group">
              <div className="applicant-signup-agreement-item">
                <label className="applicant-signup-label">
                  <input 
                    type="checkbox" 
                    name="terms"
                    checked={individualAgree.terms}
                    onChange={handleIndividualAgreeChange}
                    required
                  /> 
                  (필수) 개인회원 약관에 동의
                </label>
              </div>
              <div className="applicant-signup-agreement-item">
                <label className="applicant-signup-label">
                  <input 
                    type="checkbox" 
                    name="privacy"
                    checked={individualAgree.privacy}
                    onChange={handleIndividualAgreeChange}
                    required
                  /> 
                  (필수) 개인정보 수집 및 이용에 동의
                </label>
              </div>
              <div className="applicant-signup-agreement-item">
                <label className="applicant-signup-label">
                  <input 
                    type="checkbox" 
                    name="location"
                    checked={individualAgree.location}
                    onChange={handleIndividualAgreeChange}
                  /> 
                  (선택) 위치기반서비스 이용약관에 동의
                </label>
              </div>
              <div className="applicant-signup-agreement-item">
                <label className="applicant-signup-label">
                  <input 
                    type="checkbox" 
                    name="emailMarketing"
                    checked={individualAgree.emailMarketing}
                    onChange={handleIndividualAgreeChange}
                  /> 
                  (선택) 마케팅 정보 수신 동의 - 이메일
                </label>
              </div>
              <div className="applicant-signup-agreement-item">
                <label className="applicant-signup-label">
                  <input 
                    type="checkbox" 
                    name="smsMarketing"
                    checked={individualAgree.smsMarketing}
                    onChange={handleIndividualAgreeChange}
                  /> 
                  (선택) 마케팅 정보 수신 동의 - SMS/MMS
                </label>
              </div>
            </div>
          </div>

          <button type="submit" className="applicant-signup-button">가입하기</button>
        </form>
        )}
      </div>
    </>
  );
}

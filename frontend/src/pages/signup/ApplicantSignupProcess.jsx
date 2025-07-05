// 통합된 ApplicantSignupProcess 컴포넌트 코드입니다.
// 이메일 인증 + 아이디 중복확인 기능이 모두 포함됨

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';

export default function ApplicantSignupProcess() {
  const navigate = useNavigate();

  // 이메일 관련 상태
  const [emailLocal, setEmailLocal] = useState('');
  const [emailDomain, setEmailDomain] = useState('');
  const [customInput, setCustomInput] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(300);
  const [isSendingCode, setIsSendingCode] = useState(false);
  // 비밀번호 형식
  const [password, setPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  // 아이디 중복확인 상태
  const [idCheck, setIdCheck] = useState('');
  const [idMessage, setIdMessage] = useState('');
  const [isIdAvailable, setIsIdAvailable] = useState(null);

  // 약관 동의 관련 상태
  const [allAgree, setAllAgree] = useState(false);
  const [individualAgree, setIndividualAgree] = useState({
    terms: false,
    privacy: false,
    location: false,
    emailMarketing: false,
    smsMarketing: false,
  });

  const [errorMessage, setErrorMessage] = useState('');

  const isFormValid = isIdAvailable && isEmailVerified && isPasswordValid
  && individualAgree.terms && individualAgree.privacy
  && emailLocal && emailDomain && idCheck
  && document.getElementById('password')?.value
  && document.getElementById('phone')?.value
  && document.getElementById('candidate_name')?.value;

  // 링크를 클릭하여 들어온 개인회원의 경우 토큰
  const { token } = useParams();  // 초대 링크에서 token 추출
  const [invitationToken, setToken] = useState('');  // ✅ invitationToken 저장용
  const [fromInvite, setFromInvite] = useState(false);

  //------------------------------------------------------------------------------
  // token이 존재할 경우 → 백엔드에 token 전달 및 githubLogin 가져오기
  //------------------------------------------------------------------------------
  useEffect(() => {

    console.log("📦 useEffect 실행됨", token);
    if (token) {
      fetch(`http://localhost:8081/api/invitations/clicked/${token}`, {  // --> InvitationController
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: null
      })
        .then(res => {
          console.log("📡 응답 상태코드:", res.status);
          return res.json();
        })
        .then(async data => {
          const login = data.githubLogin;


          // ✅ 가입 여부 확인
          const res = await fetch(`http://localhost:8081/api/candidate/check-exists?githubLogin=${login}`); // --> 
          if (res.ok) {
            const json = await res.json();
            if (json.exists) {
              // 이미 가입된 사용자 → 로그인 페이지로 이동
              navigate("/auth/login", {
                state: {
                  fromInvite: true,
                  githubLogin: login,
                },
              });
              return;
            }
          }

          // ✅ 가입되지 않은 사용자 → githubLogin 고정 입력
          setFromInvite(true);
          setIdCheck(login);
          setIsIdAvailable(true);
          setToken(token);
          console.log("전달받은 토큰: ", token);
          console.log("전달받은 데이터: ", data);
        })
        .catch(err => {
          console.error("초대 클릭 처리 실패", err);
        });
    }
  }, [token]);


  // 타이머
  useEffect(() => {
    let timer;
    if (codeSent && !isEmailVerified && resendTimer > 0) {
      timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [codeSent, resendTimer, isEmailVerified]);

  // 비밀번호 입력 시 유효성 검사
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    // 영문자+숫자 조합, 최소 8자리
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (regex.test(value)) {
      setPasswordMessage('사용 가능한 비밀번호입니다.');
      setIsPasswordValid(true);
    } else {
      setPasswordMessage('영문자+숫자 조합, 최소 8자리여야 합니다.');
      setIsPasswordValid(false);
    }
  };


  // 이메일 인증코드 보내기
  const handleSendCode = async () => {
    setIsSendingCode(true);
    const fullEmail = `${emailLocal}@${emailDomain}`;
    const res = await fetch(`http://localhost:8081/api/email/send?email=${encodeURIComponent(fullEmail)}`, { method: 'POST' });
    if (res.ok) {
      alert('인증 코드가 전송되었습니다.');
      setCodeSent(true);
    } else {
      alert('코드 전송 실패');
    }
    setIsSendingCode(false);
  };

  // 이메일 인증 확인
  const handleVerifyCode = async () => {
    const fullEmail = `${emailLocal}@${emailDomain}`;
    const res = await fetch(`http://localhost:8081/api/email/verify?email=${encodeURIComponent(fullEmail)}&code=${verificationCode}`, { method: 'POST' });
    if (res.ok) {
      alert('이메일 인증 완료');
      setIsEmailVerified(true);
    } else {
      alert('인증 실패. 코드를 확인해주세요.');
    }
  };

  const handleResend = async () => {
    setCodeSent(false);
    setResendTimer(300);
    setVerificationCode('');
    await handleSendCode();
  };

  // 아이디 중복 확인
  const checkDuplicateId = async () => {
    if (!idCheck.trim()) {
      setIdMessage('아이디를 입력해주세요.');
      setIsIdAvailable(false);
      return;
    }
    try {
      const res = await fetch(`http://localhost:8081/api/candidate/check-id?githubLogin=${idCheck}`);
      if (res.ok) {
        setIdMessage('사용 가능한 아이디입니다.');
        setIsIdAvailable(true);
      } else {
        setIdMessage('이미 사용 중인 아이디입니다.');
        setIsIdAvailable(false);
      }
    } catch (e) {
      setIdMessage('확인 중 오류가 발생했습니다.');
      setIsIdAvailable(false);
    }
  };

  // 약관 관련
  const handleAllAgreeChange = () => {
    const newAllAgree = !allAgree;
    setAllAgree(newAllAgree);
    setIndividualAgree({
      terms: newAllAgree,
      privacy: newAllAgree,
      location: newAllAgree,
      emailMarketing: newAllAgree,
      smsMarketing: newAllAgree,
    });
  };

  const handleIndividualAgreeChange = (event) => {
    const { name, checked } = event.target;
    setIndividualAgree((prev) => {
      const newState = { ...prev, [name]: checked };
      setAllAgree(Object.values(newState).every(Boolean));
      return newState;
    });
  };

  // 이메일 도메인 변경 핸들러
  const handleDomainChange = (e) => {
    const value = e.target.value;
    if (value === 'custom') {
      setCustomInput(true);
      setEmailDomain('');
    } else {
      setCustomInput(false);
      setEmailDomain(value);
    }
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!idCheck || !isIdAvailable) {
      setErrorMessage('아이디를 입력하고 중복 확인을 완료해주세요.');
      return;
    }

    if (!emailLocal || !emailDomain || !isEmailVerified) {
      setErrorMessage('이메일 인증을 완료해주세요.');
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage('비밀번호 형식을 확인해주세요.');
      return;
    }

    if (!individualAgree.terms || !individualAgree.privacy) {
      setErrorMessage('필수 항목에 동의해주세요.');
      return;
    }

    if (!document.getElementById('phone')?.value || !document.getElementById('candidate_name')?.value) {
      setErrorMessage('모든 필수 입력 항목을 작성해주세요.');
      return;
    }

  setErrorMessage(''); // 모든 조건 만족 시 에러메시지 초기화
    const formData = {
      githubLogin: idCheck,
      candidatePassword: document.getElementById('password').value,
      candidatePhoneNumber: document.getElementById('phone').value,
      candidateName: document.getElementById('candidate_name').value,
      candidateEmail: `${emailLocal}@${emailDomain}`,
      candidateRegistrationDate: new Date().toISOString(),
      candidateCreatedAt: new Date().toISOString(),
      candidateUpdatedAt: new Date().toISOString(),
      invitationToken: invitationToken,
    };
    try {
      const response = await fetch('http://localhost:8081/api/candidate/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {    //요청 성공 , 상태코드 200 ~ 299
        navigate('/auth/applicant/signup/success');
        console.log("회원가입 완료. 전달한 데이터: ", formData);
      }
      else {    // 요청 성공, 서버에서 응답은 왔지만 상태코드가 실패인경우
        alert('회원가입 실패');
      }
    } catch (error) {   // fetch요청 자체가 실패한 경우
      console.error('오류 발생:', error);
      alert('서버 오류');
    }
  };

  return (
  <>
    <Navbar />
    <div className="max-w-[500px] mx-auto mt-24 mb-16 p-8 border border-gray-200 rounded-2xl shadow-xl bg-white">
      <h2 className="text-3xl font-bold text-green-700 mb-8 text-center">ZOOP 통합 개인회원 가입</h2>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* 아이디 입력 */}
        <div>
          <label className="block mb-2 font-semibold">아이디</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={idCheck}
              onChange={e => {
                if (!fromInvite) {
                  setIdCheck(e.target.value);
                  setIsIdAvailable(null);
                  setIdMessage('');
                }
              }}
              className="flex-1 border border-gray-300 px-4 py-2 rounded-lg"
              placeholder="4~20자 영문, 숫자, _ 사용"
              disabled={fromInvite}
            />
            {!fromInvite && (
              <button
                type="button"
                onClick={checkDuplicateId}
                className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600"
              >
                중복확인
              </button>
            )}
          </div>
          {idMessage && (
            <p className={`mt-1 text-sm ${isIdAvailable ? 'text-green-600' : 'text-red-500'}`}>{idMessage}</p>
          )}
        </div>

        {/* 비밀번호 */}
        <div>
          <label htmlFor="password" className="block mb-2 font-semibold">비밀번호</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="영문자+숫자 조합, 최소 8자리"
            className="w-full border border-gray-300 px-4 py-2 rounded-lg"
          />
          {passwordMessage && (
            <p className={`mt-1 text-sm ${isPasswordValid ? 'text-green-600' : 'text-red-500'}`}>
              {passwordMessage}
            </p>
          )}
        </div>

        {/* 이름 */}
        <div>
          <label htmlFor="candidate_name" className="block mb-2 font-semibold">이름</label>
          <input
            id="candidate_name"
            type="text"
            placeholder="이름을 입력해주세요"
            className="w-full border border-gray-300 px-4 py-2 rounded-lg"
          />
        </div>

        {/* 휴대폰 */}
        <div>
          <label htmlFor="phone" className="block mb-2 font-semibold">휴대폰</label>
          <input
            id="phone"
            type="text"
            placeholder="하이픈(-) 제외"
            className="w-full border border-gray-300 px-4 py-2 rounded-lg"
          />
        </div>

        {/* 이메일 입력 */}
        <div>
          <label className="block mb-2 font-semibold">이메일</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={emailLocal}
              onChange={e => setEmailLocal(e.target.value)}
              disabled={isEmailVerified}
              className="flex-1 border border-gray-300 px-4 py-2 rounded-lg bg-white text-base"
            />
            <span className="text-lg font-semibold text-gray-600">@</span>
            {customInput ? (
              <input
                type="text"
                value={emailDomain}
                onChange={e => setEmailDomain(e.target.value)}
                disabled={isEmailVerified}
                className="flex-1 border border-gray-300 px-4 py-2 rounded-lg bg-white text-base"
              />
            ) : (
              <select
                value={emailDomain}
                onChange={handleDomainChange}
                disabled={isEmailVerified}
                className="flex-1 border border-gray-300 px-4 py-2 rounded-lg bg-white text-base"
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

        {/* 인증코드 */}
        <div>
          <label className="block mb-2 font-semibold">인증코드 입력</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={verificationCode}
              onChange={e => setVerificationCode(e.target.value)}
              placeholder="6자리 인증코드"
              disabled={!codeSent || isEmailVerified}
              className="flex-1 border border-gray-300 px-4 py-2 rounded-lg bg-white"
            />
            <button
              type="button"
              onClick={codeSent ? handleVerifyCode : handleSendCode}
              disabled={isSendingCode}
              className="bg-emerald-500 text-white w-32 py-2 rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSendingCode ? '전송 중...' : codeSent ? '확인' : '인증코드 받기'}
            </button>
          </div>
          {codeSent && !isEmailVerified && (
            <div className="text-sm text-gray-600 mt-2">
              남은 시간: {Math.floor(resendTimer / 60)}:{String(resendTimer % 60).padStart(2, '0')}
              {resendTimer === 0 && (
                <button type="button" onClick={handleResend} className="ml-2 text-green-600 underline">다시 보내기</button>
              )}
            </div>
          )}
        </div>

        {/* 약관 동의 */}
        <div className="border border-gray-200 p-4 rounded-xl bg-gray-50">
          <label className="block font-semibold">
            <input type="checkbox" checked={allAgree} onChange={handleAllAgreeChange} className="mr-2" />
            전체 동의
          </label>
          <p className="text-sm text-gray-500">(필수) 약관 및 개인정보 수집 동의를 포함합니다.</p>
          <div className="mt-3 space-y-2">
            {Object.entries(individualAgree).map(([key, value]) => (
              <label key={key} className="block text-sm">
                <input type="checkbox" name={key} checked={value} onChange={handleIndividualAgreeChange} className="mr-2" />
                {(key === 'terms' || key === 'privacy') ? '(필수)' : '(선택)'} {
                  key === 'terms' ? '개인회원 약관' :
                  key === 'privacy' ? '개인정보 수집 및 이용' :
                  key === 'location' ? '위치기반서비스 이용약관' :
                  key === 'emailMarketing' ? '마케팅 정보 수신 - 이메일' :
                  '마케팅 정보 수신 - SMS/MMS'
                }
              </label>
            ))}
          </div>
        </div>

        {/* 에러 메시지 & 제출 버튼 */}
        {errorMessage && <p className="text-red-600 text-sm font-medium">⚠ {errorMessage}</p>}
        <button
          type="submit"
          disabled={!isFormValid}
          className={`
            w-full py-3 rounded-2xl font-semibold
            ${isFormValid
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
              : 'bg-emerald-500 opacity-50 text-white cursor-not-allowed'}
          `}
        >
          가입하기
        </button>
      </form>
    </div>
  </>
);

}

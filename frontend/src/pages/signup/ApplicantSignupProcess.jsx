// 통합된 ApplicantSignupProcess 컴포넌트 코드입니다.
// 이메일 인증 + 아이디 중복확인 기능이 모두 포함됨

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      const res = await fetch(`http://localhost:8081/auth/applicant/signup/check-id?githubLogin=${idCheck}`);
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
    };
    try {
      const response = await fetch('http://localhost:8081/auth/applicant/signup/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) navigate('/auth/applicant/signup/success');
      else alert('회원가입 실패');
    } catch (error) {
      console.error('오류 발생:', error);
      alert('서버 오류');
    }
  };

  return (
    <>
      <Navbar />
        <div className="max-w-xl mx-auto mt-24 mb-16 p-6 border rounded-2xl  shadow-md bg-white">
        <h2 className="text-2xl font-bold mb-6 text-center">ZOOP 통합 개인회원 가입</h2>
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* 아이디 입력 + 중복확인 */}
          <div>
            <label className="block mb-1 font-medium">아이디</label>
            <div className="flex gap-2">
              <input type="text" className="flex-1 border px-3 py-2 rounded" value={idCheck} onChange={e => {
                setIdCheck(e.target.value);
                setIsIdAvailable(null);
                setIdMessage('');
              }} placeholder="4~20자 영문, 숫자, _ 사용" />
              <button type="button" onClick={checkDuplicateId} className="bg-emerald-500 text-white px-3 py-2 rounded-xl hover:bg-emerald-600">중복확인</button>
            </div>
            {idMessage && <p className={`mt-1 text-sm ${isIdAvailable ? 'text-emerald-600' : 'text-red-500'}`}>{idMessage}</p>}
          </div>

          {/* 비밀번호 */}
          <div>
            <label htmlFor="password" className="block mb-1 font-medium">비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="영문자+숫자 조합, 최소 8자리"
              className="w-full border px-3 py-2 rounded"
            />
            {passwordMessage && (
              <p className={`mt-1 text-sm ${isPasswordValid ? 'text-emerald-600' : 'text-red-500'}`}>
                {passwordMessage}
              </p>
            )}
          </div>


          {/* 나머지 이메일 인증, 이름, 휴대폰 등은 그대로 유지 */}
          <div>
            <label htmlFor="candidate_name" className="block mb-1 font-medium">이름</label>
            <input id="candidate_name" type="text" placeholder="이름을 입력해주세요" className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label htmlFor="phone" className="block mb-1 font-medium">휴대폰</label>
            <input id="phone" type="text" placeholder="하이픈(-) 제외" className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block mb-1 font-medium">이메일</label>
            <div className="flex gap-2">
              <input type="text" value={emailLocal} onChange={e => setEmailLocal(e.target.value)} className="flex-1 border px-3 py-2 rounded" disabled={isEmailVerified} />
              <span>@</span>
              {customInput ? (
                <input type="text" value={emailDomain} onChange={e => setEmailDomain(e.target.value)} className="flex-1 border px-3 py-2 rounded" disabled={isEmailVerified} />
              ) : (
                <select value={emailDomain} onChange={handleDomainChange} className="flex-1 border px-3 py-2 rounded" disabled={isEmailVerified}>
                  <option value="">선택</option>
                  <option value="naver.com">naver.com</option>
                  <option value="gmail.com">gmail.com</option>
                  <option value="daum.net">daum.net</option>
                  <option value="custom">직접 입력</option>
                </select>
              )}
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium">인증코드 입력</label>
            <div className="flex gap-2">
              <input type="text" value={verificationCode} onChange={e => setVerificationCode(e.target.value)} placeholder="6자리 인증코드" className="flex-1 border px-3 py-2 rounded" disabled={!codeSent || isEmailVerified} />
             <button
                type="button"
                onClick={codeSent ? handleVerifyCode : handleSendCode}
                disabled={isSendingCode}
                className="
                  bg-emerald-500 text-white
                  w-32 py-2 rounded-xl
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center
                "
              >
                {isSendingCode ? '전송 중...' : codeSent ? '확인' : '인증코드 받기'}
              </button>

            </div>
            {codeSent && !isEmailVerified && (
              <div className="text-sm text-gray-600 mt-2">
                남은 시간: {Math.floor(resendTimer / 60)}:{String(resendTimer % 60).padStart(2, '0')}
                {resendTimer === 0 && (
                  <button type="button" onClick={handleResend} className="ml-2 text-emerald-600 underline">다시 보내기</button>
                )}
              </div>
            )}
          </div>

          {/* 동의사항 체크박스 */}
          <div className="border p-4 rounded bg-gray-50">
            <label className="block font-semibold">
              <input type="checkbox" checked={allAgree} onChange={handleAllAgreeChange} className="mr-2" />전체 동의
            </label>
            <p className="text-sm text-gray-500">(필수) 개인회원 약관 동의, 개인정보 수집 및 이용 동의를 포함합니다.</p>
            <div className="mt-3 space-y-2">
              {Object.entries(individualAgree).map(([key, value]) => (
                <label key={key} className="block text-sm">
                  <input type="checkbox" name={key} checked={value} onChange={handleIndividualAgreeChange} className="mr-2" />
                  {(key === 'terms' || key === 'privacy') ? '(필수)' : '(선택)'} {key === 'terms' ? '개인회원 약관' :
                  key === 'privacy' ? '개인정보 수집 및 이용' :
                  key === 'location' ? '위치기반서비스 이용약관' :
                  key === 'emailMarketing' ? '마케팅 정보 수신 - 이메일' :
                  '마케팅 정보 수신 - SMS/MMS'}
                </label>
              ))}
            </div>
          </div>

          {/* 가입하기 버튼 */}
          {errorMessage && <p className="text-red-600 text-sm">⚠ {errorMessage}</p>}
          <button
            type="submit"
            disabled={!isFormValid}
            className={`
              w-full py-2 rounded font-semibold
              ${isFormValid
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : 'bg-emerald-500 opacity-50 cursor-not-allowed text-white'}
            `}
          >
            가입하기
          </button>

        </form>
      </div>
    </>
  );
}

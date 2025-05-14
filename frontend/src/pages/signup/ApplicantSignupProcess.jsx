import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import './ApplicantSignupProcess.css';

//export default는 그 함수를 다른 파일에서 import해서 사용할 수 있도록 내보내는 역할
export default function ApplicantSignupProcess() {
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

  // 전체 동의 체크박스를 클릭했을 때
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

  // 개별 동의 체크박스를 클릭했을 때
  const handleIndividualAgreeChange = (event) => {
    const { name, checked } = event.target;
    setIndividualAgree((prev) => {
      const newIndividualAgree = { ...prev, [name]: checked };
      // 개별 항목들이 모두 체크되었으면 전체 동의도 체크
      setAllAgree(Object.values(newIndividualAgree).every(Boolean));
      return newIndividualAgree;
    });
  };

  // 가입하기 버튼 클릭했을 때
  const handleSubmit = async (event) => {
    event.preventDefault(); // 기본 form 제출 방지

    //키 값이 JPA ENTITY 객체의 프로퍼티와 일치해야한다.
    const formData = {
      githubLogin : document.getElementById('candidate_id').value,
      candidatePassword : document.getElementById('password').value,
      candidatePhoneNumber : document.getElementById('phone').value,
      candidateEmail : document.getElementById('email').value,
      candidateRegistrationDate: new Date().toISOString(),  // 현재 시각
      candidateCreatedAt: new Date().toISOString(),        // 현재 시각
      candidateUpdatedAt: new Date().toISOString(),        // 현재 시각
    };

    try {
      const response = await fetch('http://localhost:8081/auth/applicant/signup/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('회원가입 성공!');
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
        <form onSubmit={handleSubmit}>
          <div className="applicant-signup-form-group">
            <label htmlFor="candidate_id" className="applicant-signup-label">아이디</label>
            <input type="text" id="candidate_id" name="candidate_id" className="applicant-signup-input" placeholder="4~20자리/영문, 숫자, 특수문자 '_'사용 가능" />
          </div>

          <div className="applicant-signup-form-group">
            <label htmlFor="password" className="applicant-signup-label">비밀번호</label>
            <input type="password" id="password" name="password" className="applicant-signup-input" placeholder="8~16자리/영문 대소문자, 숫자, 특수문자 조합" />
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

          <button type="button" className="applicant-signup-button">인증요청</button>

          <div className="applicant-signup-form-group">
            <label htmlFor="email" className="applicant-signup-label">이메일</label>
            <input type="email" id="email" name="email" className="applicant-signup-input" defaultValue="email@saramin.co.kr" />
            <small className="applicant-signup-info-icon">ⓘ 취업에 관련된 정보를 받을 때 필요해요</small>
          </div>

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
      </div>
    </>
  );
}

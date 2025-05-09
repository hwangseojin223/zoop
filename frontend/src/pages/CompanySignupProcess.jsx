import React from 'react';
import Navbar from '../components/Navbar';
import './CompanySignup.css';

export default function CompanySignupProcess() {
  return (
    <>
      <Navbar />
      <div className="company-signup-container">
        <h2 className="form-title">통합 기업회원 가입</h2>

        <div className="form-section">
          <label htmlFor="biznum">사업자등록번호</label>
          <input
            type="text"
            id="biznum"
            placeholder="사업자 등록번호 직접 입력 (10자리)"
          />
          <button type="button" className="small-link">사업자번호가 없어요</button>
        </div>

        <div className="form-section">
          <p className="upload-instruction">사업자등록증명원을 첨부해주세요</p>
          <div className="upload-box">
            <div className="upload-preview">
              <img src="/images/sample-correct.png" alt="정상 서류 예시" />
              <img src="/images/sample-wrong.png" alt="잘못된 서류 예시" />
            </div>
            <input type="file" id="fileUpload" className="file-input" />
            <label htmlFor="fileUpload" className="file-label">파일 선택</label>
            <div className="checkbox-wrap">
              <input type="checkbox" id="nextTime" />
              <label htmlFor="nextTime">다음에 인증할게요</label>
            </div>
          </div>
        </div>

        <div className="form-section">
          <label className="terms-title">
            <input type="checkbox" /> 전체 동의
          </label>
          <ul className="terms-list">
            <li><input type="checkbox" /> (필수) 기업회원 약관에 동의</li>
            <li><input type="checkbox" /> (필수) 개인정보 수집 및 이용에 동의</li>
            <li><input type="checkbox" /> (필수) SMS 발송 서비스 약관에 동의</li>
            <li><input type="checkbox" /> (선택) 마케팅정보 수신 동의 - 이메일</li>
            <li><input type="checkbox" /> (선택) 마케팅정보 수신 동의 - SMS/MMS</li>
          </ul>
        </div>

        <button className="submit-button">회원가입 완료</button>
      </div>
    </>
  );
}

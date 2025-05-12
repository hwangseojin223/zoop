import React from 'react';
import './SignupTipBox.css';

export default function SignupTipBox() {
  return (
    <div className="tip-box">
      <h3>⭐️ TIP.</h3>

      <div className="tip-section">
        <strong>1. 사업자등록증명원이 뭐에요?</strong>
        <p className="tip-desc">
            <span>사업자등록증</span>과 달리 <strong>위조 방지용 번호</strong>와 <strong>발급 일자</strong>가 기재되어 있어요!
        </p>


        {/* ✅ 버튼을 링크로 감싸기 */}
        <a
          href="https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=12100000016"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button>사업자등록증명원 발급</button>
        </a>
        <a
          href="https://help.jobis.co/hc/ko/articles/360003271654-%EC%82%AC%EC%97%85%EC%9E%90%EB%93%B1%EB%A1%9D%EC%A6%9D%EB%AA%85-%EB%B0%9C%EA%B8%89%EB%B0%A9%EB%B2%95"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button>발급 및 다운 방법 안내</button>
        </a>
      </div>

      <div className="tip-section">
        <strong>2. 기업인증은 왜 하나요?</strong>
        <p className="tip-desc">
          안전한 채용문화를 위해<br />
          <strong>기업 서비스 이용 전</strong> 기업인증이<br />완료되어야 합니다.
        </p>
      </div>

      <div className="tip-section">
        <strong>3. 제출 서류</strong>
        <div className="tip-file">
          🏢 일반 기업, 개인, 비영리 단체<br />
          <strong>사업자등록증명원</strong> (발급 3개월 이내)
        </div>
        <div className="tip-file">
          🕵️ 헤드헌터 · 파견<br />
          <strong>사업자등록증명원 + <br />직업소개사업증 or 파견허가증</strong>
        </div>
      </div>
    </div>
  );
}

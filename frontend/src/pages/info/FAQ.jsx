import React from 'react';

function FAQ() {
  return (
    <div style={{ padding: "3rem", maxWidth: "700px", margin: "0 auto" }}>
      <h1>자주 묻는 질문 (FAQ)</h1>
      <ul style={{ marginTop: "2rem" }}>
        <li>
          <strong>Q. 회원가입이 안 돼요!</strong>
          <div>A. 이메일 형식과 비밀번호 조건을 다시 확인해주세요. 문제가 계속된다면 고객센터로 문의해 주세요.</div>
        </li>
        <li style={{ marginTop: "1.2rem" }}>
          <strong>Q. 비밀번호를 잊어버렸어요.</strong>
          <div>A. 로그인 화면에서 '비밀번호 찾기'를 클릭해 안내를 따라주세요.</div>
        </li>
        <li style={{ marginTop: "1.2rem" }}>
          <strong>Q. 기업 회원과 개인 회원 차이가 뭔가요?</strong>
          <div>A. 기업 회원은 채용 공고를 올릴 수 있고, 개인 회원은 공고에 지원할 수 있습니다.</div>
        </li>
      </ul>
    </div>
  );
}

export default FAQ;

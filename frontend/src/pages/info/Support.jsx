import React from 'react';

function Support() {
  return (
    <div style={{ padding: "3rem", maxWidth: "700px", margin: "0 auto" }}>
      <h1 style={{ color: "#22c55e" }}>고객센터</h1>
      <p style={{ margin: "1.7rem 0 2.2rem 0", fontSize: "1.13rem" }}>
        ZOOP 서비스 이용 중 궁금한 점이나 불편한 사항이 있으신가요?<br />
        아래 연락처로 문의해주시면 빠르게 답변드리겠습니다.
      </p>
      <section>
        <h2 style={{ fontSize: "1.14rem", marginBottom: "0.7rem" }}>연락처 안내</h2>
        <ul>
          <li>
            <strong>고객센터 이메일</strong>: <a href="mailto:support@zoop.com" style={{ color: "#1baf90" }}>support@zoop.com</a>
          </li>
          <li style={{ marginTop: "0.8rem" }}>
            <strong>전화</strong>: <a href="tel:1588-1234" style={{ color: "#1baf90" }}>1588-1234</a>
          </li>
          <li style={{ marginTop: "0.8rem" }}>
            <strong>운영 시간</strong>: 평일 10:00 ~ 18:00 (점심시간 12:30 ~ 13:30)
          </li>
        </ul>
      </section>

      <section style={{ marginTop: "2.2rem" }}>
        <h2 style={{ fontSize: "1.13rem", marginBottom: "0.7rem" }}>자주 묻는 질문</h2>
        <p>
          궁금한 점은 <a href="/faq" target="_blank" rel="noopener noreferrer" style={{ color: "#1baf90", fontWeight: 600, cursor: "pointer", textDecoration: "none" }}>FAQ 페이지</a>도 참고해 주세요.
        </p>
      </section>
    </div>
  );
}

export default Support;

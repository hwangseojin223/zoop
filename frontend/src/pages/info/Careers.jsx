import React from 'react';

function Careers() {
  return (
    <div style={{ padding: "3rem", maxWidth: "700px", margin: "0 auto" }}>
      <h1>채용 안내</h1>
      <p style={{ margin: "1.5rem 0 2.2rem 0", fontSize: "1.12rem" }}>
        ZOOP는 새로운 채용의 기준을 만들어갑니다.<br />
        함께 성장할 인재를 기다립니다.
      </p>

      <section>
        <h2 style={{ fontSize: "1.22rem", marginBottom: "0.8rem" }}>모집 중인 포지션</h2>
        <ul>
          <li>
            <strong>프론트엔드 개발자</strong> - React, UI/UX, 협업 툴 경험
          </li>
          <li style={{ marginTop: "0.8rem" }}>
            <strong>백엔드 개발자</strong> - Spring, DB, REST API 설계
          </li>
          <li style={{ marginTop: "0.8rem" }}>
            <strong>AI 엔지니어</strong> - Python, 머신러닝/딥러닝 경험
          </li>
          <li style={{ marginTop: "0.8rem" }}>
            <strong>사업/운영 매니저</strong> - 서비스 기획, CS, 데이터 분석
          </li>
        </ul>
      </section>

      <section style={{ marginTop: "2.5rem" }}>
        <h2 style={{ fontSize: "1.16rem", marginBottom: "0.7rem" }}>지원 방법</h2>
        <p>
          아래 이메일로 이력서와 포트폴리오를 보내주세요.<br />
          <b>recruit@zoop.com</b>
        </p>
        <p style={{ color: "#26b097", marginTop: "1.1rem" }}>
          ※ 문의 사항이 있으면 고객센터로 연락해 주세요.
        </p>
      </section>
    </div>
  );
}

export default Careers;

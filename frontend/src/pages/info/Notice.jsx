import React from 'react';

function Notice() {
  return (
    <div style={{ padding: "3rem", maxWidth: "700px", margin: "0 auto" }}>
      <h1>공지사항</h1>
      <ul style={{ marginTop: "2.2rem" }}>
        <li>
          <strong>[2024-06-01]</strong> 신규 채용 공고 시스템 오픈 안내<br />
          <span style={{ color: "#199f87", fontSize: "0.97rem" }}>
            채용 공고 작성, 지원자 관리 등 다양한 기능이 추가되었습니다.
          </span>
        </li>
        <li style={{ marginTop: "1.5rem" }}>
          <strong>[2024-05-15]</strong> 개인정보처리방침 변경 안내<br />
          <span style={{ color: "#199f87", fontSize: "0.97rem" }}>
            개인정보 관련 정책이 변경되었으니 이용에 참고해 주세요.
          </span>
        </li>
        <li style={{ marginTop: "1.5rem" }}>
          <strong>[2024-05-01]</strong> 서비스 정기점검 안내<br />
          <span style={{ color: "#199f87", fontSize: "0.97rem" }}>
            5월 3일(금) 00:00~06:00까지 시스템 점검이 진행됩니다.
          </span>
        </li>
      </ul>
    </div>
  );
}

export default Notice;

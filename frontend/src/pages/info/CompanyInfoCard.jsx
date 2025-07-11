import React from 'react';
import './CompanyInfoCard.css';

// 언어별 SVG 아이콘 (CompanySidebar에서 가져온 로직)
const LanguageIcon = ({ name }) => {
  switch (name && name.toLowerCase()) {
    case 'python':
      return <img src={process.env.PUBLIC_URL + '/languages/python.svg'} alt="Python" className="lang-icon" />;
    case 'java':
      return <img src={process.env.PUBLIC_URL + '/languages/java.svg'} alt="Java" className="lang-icon" />;
    case 'javascript':
      return <img src={process.env.PUBLIC_URL + '/languages/javascript.svg'} alt="JavaScript" className="lang-icon" />;
    case 'c++':
      return <img src={process.env.PUBLIC_URL + '/languages/cpp.svg'} alt="C++" className="lang-icon" />;
    case 'go':
      return <img src={process.env.PUBLIC_URL + '/languages/go.svg'} alt="Go" className="lang-icon" />;
    case 'ruby':
      return <img src={process.env.PUBLIC_URL + '/languages/ruby.svg'} alt="Ruby" className="lang-icon" />;
    case 'kotlin':
      return <img src={process.env.PUBLIC_URL + '/languages/kotlin.svg'} alt="Kotlin" className="lang-icon" />;
    case 'typescript':
      return <img src={process.env.PUBLIC_URL + '/languages/typescript.svg'} alt="TypeScript" className="lang-icon" />;
    default:
      return null;
  }
};

function CompanyInfoCard({ company, post }) {
  if (!company) return null;

  return (
    <div className="company-info-card">
      <div className="company-info-grid">
        <div className="label">대표자명</div>
        <div className="value">{company.ceoName || '-'}</div>
        <div className="label">기업형태</div>
        <div className="value">{company.companyType || '-'}</div>
        <div className="label">업종</div>
        <div className="value">{company.industry || '-'}</div>
        <div className="label">사원수</div>
        <div className="value">{company.employeeCount ? `${company.employeeCount}명` : '-'}</div>
        <div className="label">설립일</div>
        <div className="value">{company.companyCreatedAt ? company.companyCreatedAt.split('T')[0] : '-'}</div>
        <div className="label">매출액</div>
        <div className="value">{company.sales ? `${company.sales}원` : '-'}</div>
        <div className="label">홈페이지</div>
        <div className="value">
          {company.homepage ? (
            <a href={company.homepage} target="_blank" rel="noopener noreferrer">
              {company.homepage}
            </a>
          ) : '-'}
        </div>
        <div className="label">기업주소</div>
        <div className="value">{company.companyAddress || '-'}</div>
      </div>
      <div className="company-info-extra">
        <div className="extra-label">인재상</div>
        <div className="extra-value">{post?.postIdealCandidate || '-'}</div>
        <div className="extra-label">언어</div>
        <div className="extra-value">
          {post?.postProgrammingLanguage ? (
            <>
              <LanguageIcon name={post.postProgrammingLanguage} />
              <span style={{ marginLeft: 8 }}>{post.postProgrammingLanguage}</span>
            </>
          ) : '-'}
        </div>
      </div>
    </div>
  );
}

export default CompanyInfoCard; 
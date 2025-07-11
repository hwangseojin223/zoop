import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import PortfolioNavbar from './PortfolioNavbar';
import './PortfolioSubmissionPage.css';

function PortfolioSubmissionPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { authState } = useAuth();

  // Portfolio form input states
  const [portfolioFile, setPortfolioFile] = useState(null);
  const [portfolioContent, setPortfolioContent] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  // Career experience states
  const [isExperienced, setIsExperienced] = useState(true);
  const [totalYearsOfExperience, setTotalYearsOfExperience] = useState('');
  const [workExperiences, setWorkExperiences] = useState([
    { companyName: '', jobTitle: '', startDate: '', endDate: '', currentlyWorking: false }
  ]);

  // Long answer questions states
  const [goalStatement, setGoalStatement] = useState('');
  const [suitabilityStatement, setSuitabilityStatement] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  // New states for agreement checkboxes (from the third image)
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeRequiredPersonal, setAgreeRequiredPersonal] = useState(false);
  const [agreeOptionalPersonal, setAgreeOptionalPersonal] = useState(false);
  const [agreeFutureProposals, setAgreeFutureProposals] = useState(false);
  const [agreeReceiveRecruitmentInfo, setAgreeReceiveRecruitmentInfo] = useState(false);

  // Job posting information
  const [jobPosting, setJobPosting] = useState(null);
  const [loading, setLoading] = useState(true);

  // 실제 로그인한 사용자의 ID 사용
  const candidateId = authState.userId ? parseInt(authState.userId, 10) : null;

  // New state for veteran proof file
  const [veteranProofFile, setVeteranProofFile] = useState(null);

  useEffect(() => {
    // 사용자가 로그인하지 않았거나 candidateId가 없으면 대시보드로 리다이렉트
    if (!candidateId) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    const fetchJobPosting = async () => {
      try {
        console.log(`포트폴리오 제출 페이지 로드 - 공고 ID: ${postId}, 사용자 ID: ${candidateId}`);
        
        // 공고 정보 가져오기
        const response = await fetch(`http://localhost:8081/api/posts/${postId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setJobPosting(data);
        console.log('공고 정보:', data);
        
      } catch (error) {
        console.error('공고 정보를 가져오는 중 오류 발생:', error);
        // 오류 발생 시 기본값 설정
        setJobPosting({
          postTitle: '공고 정보를 불러올 수 없습니다',
          companyName: '정보 없음'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJobPosting();
  }, [postId, candidateId, navigate]);

  // Effect to update individual checkboxes when 'agreeAll' changes
  useEffect(() => {
    setAgreeRequiredPersonal(agreeAll);
    setAgreeOptionalPersonal(agreeAll);
    setAgreeFutureProposals(agreeAll);
    setAgreeReceiveRecruitmentInfo(agreeAll);
  }, [agreeAll]);

  // Effect to update 'agreeAll' when individual checkboxes change
  useEffect(() => {
    if (agreeRequiredPersonal && agreeOptionalPersonal && agreeFutureProposals && agreeReceiveRecruitmentInfo) {
      setAgreeAll(true);
    } else {
      setAgreeAll(false);
    }
  }, [agreeRequiredPersonal, agreeOptionalPersonal, agreeFutureProposals, agreeReceiveRecruitmentInfo]);

  const handleAddWorkExperience = () => {
    if (workExperiences.length < 5) {
      setWorkExperiences([...workExperiences, { companyName: '', jobTitle: '', startDate: '', endDate: '', currentlyWorking: false }]);
    } else {
      alert('업무 경험은 최대 5개까지 작성할 수 있습니다.');
    }
  };

  const handleRemoveWorkExperience = (index) => {
    const newWorkExperiences = workExperiences.filter((_, i) => i !== index);
    setWorkExperiences(newWorkExperiences);
  };

  const handleWorkExperienceChange = (index, field, value) => {
    const newWorkExperiences = workExperiences.map((exp, i) => {
      if (i === index) {
        if (field === 'currentlyWorking') {
          if (value) {
            // 재직중 체크: endDate를 오늘 날짜로 자동 입력
            return { ...exp, currentlyWorking: true, endDate: new Date().toISOString().slice(0, 10) };
          } else {
            // 체크 해제: endDate를 빈 값으로
            return { ...exp, currentlyWorking: false, endDate: '' };
          }
        }
        return { ...exp, [field]: value };
      }
      return exp;
    });
    setWorkExperiences(newWorkExperiences);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate candidateId
    if (!candidateId) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    // Validate required agreement
    if (!agreeRequiredPersonal) {
      alert('필수 개인정보 수집 및 이용에 동의해야 합니다.');
      return;
    }

    // Validate portfolio file is required
    if (!portfolioFile) {
      alert('포트폴리오 파일을 선택해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('postId', parseInt(postId, 10));
    formData.append('candidateId', candidateId);
    formData.append('portfolioContent', portfolioContent);
    formData.append('portfolioUrl', portfolioUrl);

    console.log('제출 전 파일 상태:', { portfolioFile, resumeFile });
    
    if (portfolioFile) {
      console.log('포트폴리오 파일 추가:', portfolioFile.name, portfolioFile.size);
      formData.append('portfolioFile', portfolioFile);
    } else {
      console.log('포트폴리오 파일이 선택되지 않음');
    }
    if (resumeFile) {
      console.log('이력서 파일 추가:', resumeFile.name, resumeFile.size);
      formData.append('resumeFile', resumeFile);
    } else {
      console.log('이력서 파일이 선택되지 않음');
    }

    formData.append('careerData', JSON.stringify({
      isExperienced: isExperienced,
      totalYearsOfExperience: isExperienced ? parseInt(totalYearsOfExperience, 10) : 0,
      workExperiences: isExperienced ? workExperiences : []
    }));

    formData.append('goalStatement', goalStatement);
    formData.append('suitabilityStatement', suitabilityStatement);

    // Append agreement statuses
    formData.append('agreeRequiredPersonal', agreeRequiredPersonal);
    formData.append('agreeOptionalPersonal', agreeOptionalPersonal);
    formData.append('agreeFutureProposals', agreeFutureProposals);
    formData.append('agreeReceiveRecruitmentInfo', agreeReceiveRecruitmentInfo);

    if (veteranProofFile) {
      formData.append('veteranProofFile', veteranProofFile);
    }

    console.log("workExperiences to submit:", workExperiences);

    try {
        const response = await fetch('/api/portfolios', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();
        console.log('제출 성공:', result);
        alert('지원서가 성공적으로 제출되었습니다.');
        navigate('/candidate/dashboard');

    } catch (error) {
        console.error('지원서 제출 오류:', error);
        alert(`지원서 제출 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="portfolio-submission-container">
        <PortfolioNavbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>공고 정보를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-submission-container">
      <PortfolioNavbar />
      
      <div className="portfolio-header">
        <div className="header-content">
          <h1 className="main-title">지원서 작성하기</h1>
          <div className="job-info">
            <div className="company-job-container">
              <span className="company-name">{jobPosting?.companyName || '회사명을 불러올 수 없습니다'}</span>
              <span className="separator">|</span>
              <span className="job-title">{jobPosting?.postTitle || '공고 제목을 불러올 수 없습니다'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions/Disclaimer */}
      <div className="instructions-card">
        <div className="company-intro">
          <p className="company-description">이력서 첨부와 함께 아래 내용을 작성해주시기 바랍니다.</p>
        </div>
        <div className="disclaimer">
          <p className="disclaimer-text">
            당사는 지원자분의 역량을 최우선적으로 검토하며, 채용과정에서 지원자의 주민등록번호, 가족관계, 혼인여부, 연봉, 사진, 신체조건, 출신지역에 대한 정보를 요구하지 않습니다.
          </p>
          <p className="warning-text">
            <strong>① 작성 내용은 제출 후 확인 및 수정이 어렵습니다. 미리 다른 곳에 저장해 두시는 것을 권장합니다.</strong>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="portfolio-form">
        {/* Long Answer Questions */}
        <div className="form-section">
          <h3 className="section-title">자기소개서</h3>
          
          <div className="question-group">
            <label htmlFor="goalStatement" className="question-label">
              1. 해당 포지션으로 합류 시 목표하는 점을 자세히 적어주세요.
              <span className="char-limit">(500자 내외)</span>
            </label>
            <textarea
              id="goalStatement"
              value={goalStatement}
              onChange={(e) => setGoalStatement(e.target.value)}
              maxLength="700"
              placeholder="(최대 700자, 공백 포함)"
              className="question-textarea"
              required
            />
            <div className="char-counter">
              {goalStatement.length}/700자
            </div>
          </div>

          <div className="question-group">
            <label htmlFor="suitabilityStatement" className="question-label">
              2. 해당 포지션에 본인이 적합하다고 생각하는 이유를 상세히 적어주세요.
              <span className="char-limit">(500자 내외)</span>
            </label>
            <textarea
              id="suitabilityStatement"
              value={suitabilityStatement}
              onChange={(e) => setSuitabilityStatement(e.target.value)}
              maxLength="700"
              placeholder="(최대 700자, 공백 포함)"
              className="question-textarea"
              required
            />
            <div className="char-counter">
              {suitabilityStatement.length}/700자
            </div>
          </div>
        </div>

        {/* File Uploads */}
        <div className="form-section">
          <h3 className="section-title">첨부파일</h3>
          
          <div className="file-upload-group">
            <label className="file-upload-label">
              <div className="file-upload-content">
                <div className="file-icon">📁</div>
                <div className="file-info">
                  <span className="file-title">포트폴리오</span>
                  <span className="file-subtitle">* 필수</span>
                </div>
                <div className="file-name">
                  {portfolioFile ? portfolioFile.name : '파일 첨부 (최대 50MB)'}
                </div>
              </div>
              <input
                type="file"
                onChange={(e) => setPortfolioFile(e.target.files[0])}
                accept=".pdf,.zip,.rar,.png,.jpg,.jpeg"
                className="file-input"
                required
              />
            </label>
          </div>

          <div className="file-upload-group">
            <label className="file-upload-label">
              <div className="file-upload-content">
                <div className="file-icon">📄</div>
                <div className="file-info">
                  <span className="file-title">이력서 및 경력기술서</span>
                  <span className="file-subtitle">선택</span>
                </div>
                <div className="file-name">
                  {resumeFile ? resumeFile.name : '파일 첨부 (최대 50MB)'}
                </div>
              </div>
              <input
                type="file"
                onChange={(e) => setResumeFile(e.target.files[0])}
                accept=".pdf,.doc,.docx"
                className="file-input"
              />
            </label>
          </div>

          <div className="file-upload-group">
            <label className="file-upload-label">
              <div className="file-upload-content">
                <div className="file-icon">🪪</div>
                <div className="file-info">
                  <span className="file-title">국가보훈대상자 증빙 서류</span>
                </div>
                <div className="file-name">
                  {veteranProofFile ? veteranProofFile.name : '파일 첨부 (최대 50MB)'}
                </div>
              </div>
              <input
                type="file"
                onChange={(e) => setVeteranProofFile(e.target.files[0])}
                className="file-input"
              />
            </label>
            <div style={{ color: '#2574c7', fontSize: 14, marginTop: 4 }}>
              국가보훈대상자는 관련 법률에 의거 우대합니다. 해당하실 경우, 증빙 서류를 첨부해 주세요.
            </div>
          </div>
        </div>

        {/* Career Section */}
        <div className="form-section">
          <h3 className="section-title">경력 정보</h3>
          
          <div className="career-type-selector">
            <label className="radio-option">
              <input
                type="radio"
                value="experienced"
                checked={isExperienced === true}
                onChange={() => setIsExperienced(true)}
                className="radio-input"
              />
              <span className="radio-custom"></span>
              <span className="radio-label">경력</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                value="newbie"
                checked={isExperienced === false}
                onChange={() => setIsExperienced(false)}
                className="radio-input"
              />
              <span className="radio-custom"></span>
              <span className="radio-label">신입 (경력 없음)</span>
            </label>
          </div>

          {isExperienced && (
            <div className="experience-years">
              <label htmlFor="totalYearsOfExperience" className="experience-label">
                총 경력 기간 <span className="required">*</span>
              </label>
              <div className="years-input-group">
                <input
                  type="number"
                  id="totalYearsOfExperience"
                  value={totalYearsOfExperience}
                  onChange={(e) => setTotalYearsOfExperience(e.target.value)}
                  placeholder="0"
                  required={isExperienced}
                  className="years-input"
                />
                <span className="years-unit">년</span>
              </div>
            </div>
          )}
        </div>

        {isExperienced && (
          <div className="form-section">
            <h3 className="section-title">업무 경험</h3>
            <p className="section-description">최근 재직 기준으로 5개까지 작성할 수 있어요.</p>
            
            {workExperiences.map((experience, index) => (
              <div key={index} className="experience-card">
                {workExperiences.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => handleRemoveWorkExperience(index)} 
                    className="remove-experience-btn"
                  >
                    ✕
                  </button>
                )}
                
                <div className="experience-form">
                  <div className="form-row">
                    <div className="form-field">
                      <label htmlFor={`companyName-${index}`} className="field-label">
                        회사명 <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id={`companyName-${index}`}
                        value={experience.companyName}
                        onChange={(e) => handleWorkExperienceChange(index, 'companyName', e.target.value)}
                        placeholder="회사명을 검색해주세요."
                        required
                        className="form-input"
                      />
                    </div>
                    
                    <div className="form-field">
                      <label htmlFor={`jobTitle-${index}`} className="field-label">
                        담당 직무명 <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id={`jobTitle-${index}`}
                        value={experience.jobTitle}
                        onChange={(e) => handleWorkExperienceChange(index, 'jobTitle', e.target.value)}
                        placeholder="(예시) Frontend Developer"
                        required
                        className="form-input"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-field">
                      <label className="field-label">
                        재직 기간 <span className="required">*</span>
                      </label>
                      <div className="date-range">
                        <input
                          type="date"
                          value={experience.startDate}
                          onChange={(e) => handleWorkExperienceChange(index, 'startDate', e.target.value)}
                          required
                          className="date-input"
                        />
                        <span className="date-separator">~</span>
                        {!experience.currentlyWorking && (
                          <input
                            type="date"
                            value={experience.endDate}
                            onChange={(e) => handleWorkExperienceChange(index, 'endDate', e.target.value)}
                            required={!experience.currentlyWorking}
                            className="date-input"
                          />
                        )}
                        <label className="currently-working">
                          <input
                            type="checkbox"
                            checked={experience.currentlyWorking}
                            onChange={(e) => handleWorkExperienceChange(index, 'currentlyWorking', e.target.checked)}
                            className="checkbox-input"
                          />
                          <span className="checkbox-custom"></span>
                          재직중
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {workExperiences.length < 5 && (
              <button 
                type="button" 
                onClick={handleAddWorkExperience} 
                className="add-experience-btn"
              >
                + 업무 경험 추가
              </button>
            )}
          </div>
        )}

        {/* Agreement Section */}
        <div className="form-section agreement-section">
          <h3 className="section-title">개인정보 수집 및 이용 동의</h3>
          
          <div className="agreement-all">
            <label className="agreement-all-label">
              <input
                type="checkbox"
                id="agreeAll"
                checked={agreeAll}
                onChange={() => setAgreeAll(!agreeAll)}
                className="checkbox-input large"
              />
              <span className="checkbox-custom large"></span>
              <span className="agreement-all-text">전체 동의</span>
              <span className="agreement-all-subtext">아래의 필수와 선택의 항목에 모두 동의할게요.</span>
            </label>
          </div>

          <div className="agreement-divider"></div>

          <div className="agreement-items">
            <div className="agreement-item">
              <label className="agreement-item-label">
                <input
                  type="checkbox"
                  id="agreeRequiredPersonal"
                  checked={agreeRequiredPersonal}
                  onChange={() => setAgreeRequiredPersonal(!agreeRequiredPersonal)}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                <span className="agreement-text">필수 개인정보 수집 및 이용 동의</span>
              </label>
              <a href="#" className="agreement-link">보기</a>
            </div>

            <div className="agreement-item">
              <label className="agreement-item-label">
                <input
                  type="checkbox"
                  id="agreeOptionalPersonal"
                  checked={agreeOptionalPersonal}
                  onChange={() => setAgreeOptionalPersonal(!agreeOptionalPersonal)}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                <span className="agreement-text">선택 개인정보 수집 및 이용 동의</span>
              </label>
              <a href="#" className="agreement-link">보기</a>
            </div>

            <div className="agreement-item">
              <label className="agreement-item-label">
                <input
                  type="checkbox"
                  id="agreeFutureProposals"
                  checked={agreeFutureProposals}
                  onChange={() => setAgreeFutureProposals(!agreeFutureProposals)}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                <span className="agreement-text">선택 추후 적합한 포지션 제안을 위한 개인정보 수집 및 이용에 동의합니다</span>
              </label>
              <a href="#" className="agreement-link">보기</a>
            </div>
            <p className="agreement-note">제안에 동의해주셔야 추후 더 적합한 포지션을 채용담당자로부터 제안 받을 수 있어요.</p>

            <div className="agreement-item">
              <label className="agreement-item-label">
                <input
                  type="checkbox"
                  id="agreeReceiveRecruitmentInfo"
                  checked={agreeReceiveRecruitmentInfo}
                  onChange={() => setAgreeReceiveRecruitmentInfo(!agreeReceiveRecruitmentInfo)}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                <span className="agreement-text">선택 추후 공개채용 등이 오픈되었을 때 채용정보를 수신하는 것에 동의합니다</span>
              </label>
              <a href="#" className="agreement-link">보기</a>
            </div>
          </div>

          <p className="agreement-warning">
            * 이 사항에 해당할 경우, 채용 전형의 진행이 중지되거나 채용이 취소될 수 있습니다.
          </p>
        </div>

        <button type="submit" className="submit-button">
          지원서 제출하기
        </button>
      </form>
    </div>
  );
}

export default PortfolioSubmissionPage;
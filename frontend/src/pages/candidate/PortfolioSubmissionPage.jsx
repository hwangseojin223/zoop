import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function PortfolioSubmissionPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

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


  const candidateId = 13;

  useEffect(() => {
    console.log(`포트폴리오 제출 페이지 로드 - 공고 ID: ${postId}, 사용자 ID: ${candidateId}`);
  }, [postId, candidateId]);

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
        return { ...exp, [field]: value };
      }
      return exp;
    });
    setWorkExperiences(newWorkExperiences);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required agreement
    if (!agreeRequiredPersonal) {
      alert('필수 개인정보 수집 및 이용에 동의해야 합니다.');
      return;
    }

    const formData = new FormData();
    formData.append('postId', parseInt(postId, 10));
    formData.append('candidateId', candidateId);
    formData.append('portfolioContent', portfolioContent);
    formData.append('portfolioUrl', portfolioUrl);

    if (portfolioFile) {
      formData.append('portfolioFile', portfolioFile);
    }
    if (resumeFile) {
      formData.append('resumeFile', resumeFile);
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
        alert('지원서가 성공적으로 제출되었습니다.'); // Changed alert message
        navigate('/candidate/dashboard');

    } catch (error) {
        console.error('지원서 제출 오류:', error); // Changed error message
        alert(`지원서 제출 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>지원서 작성</h1>
      <p>공고 ID: {postId}</p>
      <p>사용자 ID: {candidateId}</p>

      {/* Instructions/Disclaimer */}
      <div style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <p style={{ margin: '0 0 5px 0' }}>토스와 함께,</p>
        <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>커머스의 성장을 만듭니다.</h2>
        <p style={{ fontSize: '0.9em', color: '#555' }}>이력서 첨부와 함께 아래 내용을 작성해주시기 바랍니다.</p>
        <p style={{ fontSize: '0.85em', color: '#777' }}>당사는 지원자분의 역량을 최우선적으로 검토하며, 채용과정에서 지원자의 주민등록번호, 가족관계, 혼인여부, 연봉, 사진, 신체조건, 출신지역에 대한 정보를 요구하지 않습니다.</p>
        <p style={{ color: 'red', fontSize: '0.9em', fontWeight: 'bold' }}>
          <strong>① 작성 내용은 제출 후 확인 및 수정이 어렵습니다. 미리 다른 곳에 저장해 두시는 것을 권장합니다.</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Long Answer Questions */}
        <div style={{ marginBottom: '30px' }}>
          <label htmlFor="goalStatement" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            1. 토스의 Sales Operations Specialist (커머스)로 합류 시 목표하는 점을 자세히 적어주세요. (500자 내외)
          </label>
          <textarea
            id="goalStatement"
            value={goalStatement}
            onChange={(e) => setGoalStatement(e.target.value)}
            rows="10"
            cols="50"
            maxLength="700"
            placeholder="(최대 700자, 공백 포함)"
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
            required
          />
        </div>
        <div style={{ marginBottom: '30px' }}>
          <label htmlFor="suitabilityStatement" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            2. 해당 포지션에 본인이 적합하다고 생각하는 이유를 상세히 적어주세요. (500자 내외)
          </label>
          <textarea
            id="suitabilityStatement"
            value={suitabilityStatement}
            onChange={(e) => setSuitabilityStatement(e.target.value)}
            rows="10"
            cols="50"
            maxLength="700"
            placeholder="(최대 700자, 공백 포함)"
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
            required
          />
        </div>

        {/* File Uploads */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '10px' }}>이력서 및 경력기술서*</h3>
          <label htmlFor="resumeFile" style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', padding: '10px', borderRadius: '5px', cursor: 'pointer', backgroundColor: '#f0f0f0' }}>
            <span style={{ marginRight: '10px', color: '#666' }}>📄</span>
            {resumeFile ? resumeFile.name : '파일 첨부 (최대 50MB)'}
            <input
              type="file"
              id="resumeFile"
              onChange={(e) => setResumeFile(e.target.files[0])}
              accept=".pdf,.doc,.docx"
              style={{ display: 'none' }}
              required
            />
          </label>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '10px' }}>포트폴리오</h3>
          <label htmlFor="portfolioFile" style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', padding: '10px', borderRadius: '5px', cursor: 'pointer', backgroundColor: '#f0f0f0' }}>
            <span style={{ marginRight: '10px', color: '#666' }}>📄</span>
            {portfolioFile ? portfolioFile.name : '파일 첨부 (최대 50MB)'}
            <input
              type="file"
              id="portfolioFile"
              onChange={(e) => setPortfolioFile(e.target.files[0])}
              accept=".pdf,.zip,.rar,.png,.jpg,.jpeg" // Expanded accepted types
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* Career Section */}
        <fieldset style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
          <legend style={{ fontWeight: 'bold', fontSize: '1.1em', padding: '0 10px' }}>경력</legend>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ marginRight: '20px' }}>
              <input
                type="radio"
                value="experienced"
                checked={isExperienced === true}
                onChange={() => setIsExperienced(true)}
                style={{ marginRight: '5px' }}
              />
              경력
            </label>
            <label>
              <input
                type="radio"
                value="newbie"
                checked={isExperienced === false}
                onChange={() => setIsExperienced(false)}
                style={{ marginRight: '5px' }}
              />
              신입 (경력 없음)
            </label>
          </div>

          {isExperienced && (
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="totalYearsOfExperience" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>총 경력 기간*</label>
              <input
                type="number"
                id="totalYearsOfExperience"
                value={totalYearsOfExperience}
                onChange={(e) => setTotalYearsOfExperience(e.target.value)}
                placeholder="0"
                required={isExperienced}
                style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '80px', marginRight: '5px' }}
              />
              <span style={{ fontWeight: 'bold' }}>년</span>
            </div>
          )}
        </fieldset>

        {isExperienced && (
          <fieldset style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
            <legend style={{ fontWeight: 'bold', fontSize: '1.1em', padding: '0 10px' }}>업무 경험</legend>
            <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '15px' }}>최근 재직 기준으로 5개까지 작성할 수 있어요.</p>
            {workExperiences.map((experience, index) => (
              <div key={index} style={{ border: '1px solid #e0e0e0', padding: '15px', margin: '10px 0', borderRadius: '8px', backgroundColor: '#fdfdfd', position: 'relative' }}>
                {workExperiences.length > 1 && (
                    <button type="button" onClick={() => handleRemoveWorkExperience(index)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2em', color: '#999' }}>X</button>
                )}
                <div style={{ marginBottom: '10px' }}>
                  <label htmlFor={`companyName-${index}`} style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>회사명*</label>
                  <input
                    type="text"
                    id={`companyName-${index}`}
                    value={experience.companyName}
                    onChange={(e) => handleWorkExperienceChange(index, 'companyName', e.target.value)}
                    placeholder="회사명을 검색해주세요."
                    required
                    style={{ width: 'calc(100% - 22px)', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label htmlFor={`jobTitle-${index}`} style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>담당 직무명*</label>
                  <input
                    type="text"
                    id={`jobTitle-${index}`}
                    value={experience.jobTitle}
                    onChange={(e) => handleWorkExperienceChange(index, 'jobTitle', e.target.value)}
                    placeholder="(예시) Frontend Developer"
                    required
                    style={{ width: 'calc(100% - 22px)', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label htmlFor={`startDate-${index}`} style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>재직 기간*</label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="date"
                      id={`startDate-${index}`}
                      value={experience.startDate}
                      onChange={(e) => handleWorkExperienceChange(index, 'startDate', e.target.value)}
                      required
                      style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginRight: '10px' }}
                    />
                    <span style={{ marginRight: '10px' }}> ~ </span>
                    {!experience.currentlyWorking && (
                      <input
                        type="date"
                        id={`endDate-${index}`}
                        value={experience.endDate}
                        onChange={(e) => handleWorkExperienceChange(index, 'endDate', e.target.value)}
                        required={!experience.currentlyWorking}
                        style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    )}
                    <label style={{ marginLeft: '15px' }}>
                      <input
                        type="checkbox"
                        checked={experience.currentlyWorking}
                        onChange={(e) => handleWorkExperienceChange(index, 'currentlyWorking', e.target.checked)}
                        style={{ marginRight: '5px' }}
                      />
                      재직중
                    </label>
                  </div>
                </div>
              </div>
            ))}
            {workExperiences.length < 5 && (
              <button type="button" onClick={handleAddWorkExperience} style={{ padding: '8px 15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}>+ 추가</button>
            )}
          </fieldset>
        )}

        {/* Agreement Section (NEW from third image) */}
        <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <input
              type="checkbox"
              id="agreeAll"
              checked={agreeAll}
              onChange={() => setAgreeAll(!agreeAll)}
              style={{ marginRight: '10px', transform: 'scale(1.2)' }}
            />
            <label htmlFor="agreeAll" style={{ fontWeight: 'bold', fontSize: '1.1em' }}>전체 동의</label>
            <span style={{ marginLeft: '10px', color: '#666', fontSize: '0.9em' }}>아래의 필수와 선택의 항목에 모두 동의할게요.</span>
          </div>

          <div style={{ borderBottom: '1px solid #eee', margin: '15px 0' }}></div>

          <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              id="agreeRequiredPersonal"
              checked={agreeRequiredPersonal}
              onChange={() => setAgreeRequiredPersonal(!agreeRequiredPersonal)}
              style={{ marginRight: '10px' }}
            />
            <label htmlFor="agreeRequiredPersonal" style={{ flexGrow: 1 }}>필수 개인정보 수집 및 이용 동의</label>
            <a href="#" style={{ color: '#007bff', textDecoration: 'none', fontSize: '0.9em' }}>보기</a>
          </div>

          <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              id="agreeOptionalPersonal"
              checked={agreeOptionalPersonal}
              onChange={() => setAgreeOptionalPersonal(!agreeOptionalPersonal)}
              style={{ marginRight: '10px' }}
            />
            <label htmlFor="agreeOptionalPersonal" style={{ flexGrow: 1 }}>선택 개인정보 수집 및 이용 동의</label>
            <a href="#" style={{ color: '#007bff', textDecoration: 'none', fontSize: '0.9em' }}>보기</a>
          </div>

          <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              id="agreeFutureProposals"
              checked={agreeFutureProposals}
              onChange={() => setAgreeFutureProposals(!agreeFutureProposals)}
              style={{ marginRight: '10px' }}
            />
            <label htmlFor="agreeFutureProposals" style={{ flexGrow: 1 }}>선택 추후 적합한 포지션 제안을 위한 개인정보 수집 및 이용에 동의합니다</label>
            <a href="#" style={{ color: '#007bff', textDecoration: 'none', fontSize: '0.9em' }}>보기</a>
          </div>
          <p style={{ marginLeft: '30px', fontSize: '0.8em', color: '#888', marginTop: '-5px', marginBottom: '10px' }}>제안에 동의해주셔야 추후 더 적합한 포지션을 채용담당자로부터 제안 받을 수 있어요.</p>


          <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              id="agreeReceiveRecruitmentInfo"
              checked={agreeReceiveRecruitmentInfo}
              onChange={() => setAgreeReceiveRecruitmentInfo(!agreeReceiveRecruitmentInfo)}
              style={{ marginRight: '10px' }}
            />
            <label htmlFor="agreeReceiveRecruitmentInfo" style={{ flexGrow: 1 }}>선택 추후 공개채용 등이 오픈되었을 때 채용정보를 수신하는 것에 동의합니다</label>
            <a href="#" style={{ color: '#007bff', textDecoration: 'none', fontSize: '0.9em' }}>보기</a>
          </div>

          <p style={{ fontSize: '0.85em', color: '#d9534f', marginTop: '20px' }}>
            * 이 사항에 해당할 경우, 채용 전형의 진행이 중지되거나 채용이 취소될 수 있습니다.
          </p>
        </div>

        <button type="submit" style={{ marginTop: '30px', padding: '12px 25px', fontSize: '1.2em', background: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', width: '100%' }}>제출하기</button>
      </form>
    </div>
  );
}

export default PortfolioSubmissionPage;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import ResumeBasicInfoSection from './ResumeBasicInfoSection';
import ResumeEducationSection from './ResumeEducationSection';
import ResumeCareerSection from './ResumeCareerSection';
import ResumeSelfIntroSection from './ResumeSelfIntroSection';
import ResumeFileUploadSection from './ResumeFileUploadSection';
import './ResumeSubmissionPage.css';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaSave, FaCheck } from 'react-icons/fa';

const ResumeSubmissionPage = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    education: [],
    career: [],
    selfIntro: '',
    file: null,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 임시저장 값이 있으면 우선 적용, 없으면 사용자 정보 fetch
  useEffect(() => {
    const draft = localStorage.getItem('resumeDraft');
    if (draft) {
      try {
        setForm(prev => ({ ...prev, ...JSON.parse(draft) }));
        return;
      } catch {}
    }
    // 임시저장 없을 때만 사용자 정보 fetch
    const fetchUserInfo = async () => {
      if (!authState.userId) return;
      try {
        const res = await fetch(`http://localhost:8081/api/candidates/${authState.userId}`);
        if (res.ok) {
          const data = await res.json();
          setForm(prev => ({
            ...prev,
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
          }));
        }
      } catch (e) {
        // 에러 무시(수동 입력 가능)
      }
    };
    fetchUserInfo();
  }, [authState.userId]);

  // 이력서, 학력, 경력, 포트폴리오 등록 API 호출
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. 이력서+학력+경력 한 번에 등록
      // education의 school -> schoolName 변환 및 빈 값 처리
      const educations = (form.education || []).map(edu => {
        const e = { ...edu, schoolName: edu.school };
        // undefined/null → '' 처리
        Object.keys(e).forEach(k => { if (e[k] === undefined || e[k] === null) e[k] = ''; });
        return e;
      });
      // experiences 변환: 필수값 없는 항목 제외, 필드명 매핑, Y/N 변환, 빈 값 처리
      const experiences = (form.career || [])
        .filter(exp => exp.company && (exp.jobTitle || exp.job)) // 회사명, 직무 필수
        .map(exp => {
          const ex = {
            ...exp,
            companyName: exp.company,
            jobTitle: exp.jobTitle || exp.job,
            isCompanyHidden: exp.isCompanyHidden ? "Y" : "N",
            isCurrent: exp.isCurrent ? "Y" : "N",
          };
          Object.keys(ex).forEach(k => { if (ex[k] === undefined || ex[k] === null) ex[k] = ''; });
          return ex;
        });
      const resumeRes = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: authState.userId, // 실제 로그인 유저 ID 사용
          selfIntro: form.selfIntro,
          isPublic: 'Y',
          status: 'active',
          educations, // 변환된 배열 사용
          experiences, // 변환된 배열 사용
        }),
      });
      if (!resumeRes.ok) {
        let errorMsg = '알 수 없는 오류가 발생했습니다.';
        try {
          const text = await resumeRes.text();
          try {
            const json = JSON.parse(text);
            errorMsg = json.message || JSON.stringify(json);
          } catch {
            errorMsg = text;
          }
        } catch (e) {}
        throw new Error(errorMsg);
      }
      const resumeId = await resumeRes.json();

      // 2. 포트폴리오 파일 업로드
      if (form.file) {
        const fd = new FormData();
        fd.append('candidateId', authState.userId);
        fd.append('portfolioFile', form.file);
        const portRes = await fetch('/api/portfolios/resume-upload', {
          method: 'POST',
          body: fd,
        });
        if (!portRes.ok) {
          let errorMsg = '알 수 없는 오류가 발생했습니다.';
          try {
            const text = await portRes.text();
            try {
              const json = JSON.parse(text);
              errorMsg = json.message || JSON.stringify(json);
            } catch {
              errorMsg = text;
            }
          } catch (e) {}
          throw new Error(errorMsg);
        }
      }
      alert('이력서 및 포트폴리오가 성공적으로 등록되었습니다!');
      navigate('/candidate/dashboard');
    } catch (err) {
      alert('등록 중 오류 발생: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 임시저장 핸들러 (localStorage 활용)
  const handleSave = () => {
    setSaving(true);
    try {
      localStorage.setItem('resumeDraft', JSON.stringify(form));
      alert('임시저장 되었습니다!');
    } catch (e) {
      alert('임시저장 중 오류 발생: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    if (window.confirm('정말 취소하시겠습니까? 작성 중인 내용은 저장되지 않습니다.')) {
      navigate(-1); // 이전 페이지로 이동
    }
  };

  return (
    <form className="resume-submission-page" onSubmit={handleSubmit} style={{ paddingBottom: '100px' }}>
      <h1 className="resume-title">이력서 등록</h1>
      <div className="resume-basic-info-wrapper">
        <ResumeBasicInfoSection form={form} setForm={setForm} />
      </div>
      <div className="resume-section-wrapper">
        <ResumeEducationSection form={form} setForm={setForm} />
      </div>
      <div className="resume-section-wrapper">
        <ResumeCareerSection form={form} setForm={setForm} />
      </div>
      <div className="resume-section-wrapper">
        <ResumeSelfIntroSection form={form} setForm={setForm} />
      </div>
      <div className="resume-section-wrapper">
        <ResumeFileUploadSection form={form} setForm={setForm} />
      </div>
      {/* 하단 고정 버튼 영역 - 세련된 스타일 적용 */}
      <div className="resume-fixed-action-bar">
        <button
          type="button"
          onClick={handleCancel}
          className="resume-cancel-btn styled-action-btn"
          aria-label="이력서 등록 취소"
        >
          <FaTimes style={{ marginRight: 8 }} /> 취소
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="resume-save-btn styled-action-btn"
          aria-label="임시저장"
        >
          <FaSave style={{ marginRight: 8 }} /> {saving ? '저장 중...' : '임시저장'}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="resume-submit-btn styled-action-btn"
          aria-label="이력서 제출"
        >
          <FaCheck style={{ marginRight: 8 }} /> {loading ? '등록 중...' : '제출'}
        </button>
      </div>
    </form>
  );
};

export default ResumeSubmissionPage; 
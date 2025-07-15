import React from 'react';
import { FaPlus, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';

const ResumeCareerSection = ({ form, setForm }) => {
  const handleChange = (idx, field, value) => {
    const newCareer = [...(form.career || [])];
    // 날짜 필드 처리: YYYY-MM → 연,월 분리
    if (field === 'startDate' && value) {
      const [year, month] = value.split('-');
      newCareer[idx]['startYear'] = year;
      newCareer[idx]['startMonth'] = month;
      newCareer[idx]['startDate'] = value;
    } else if (field === 'endDate' && value) {
      const [year, month] = value.split('-');
      newCareer[idx]['endYear'] = year;
      newCareer[idx]['endMonth'] = month;
      newCareer[idx]['endDate'] = value;
    } else if (field === 'job') {
      newCareer[idx]['jobTitle'] = value;
      newCareer[idx]['job'] = value;
    } else if (field === 'current') {
      newCareer[idx]['isCurrent'] = value;
      newCareer[idx]['current'] = value;
      if (value) newCareer[idx]['endDate'] = '';
    } else {
      newCareer[idx][field] = value;
    }
    setForm((prev) => ({ ...prev, career: newCareer }));
  };
  
  const addCareer = () => {
    setForm((prev) => ({ 
      ...prev, 
      career: [...(prev.career || []), { 
        company: '', 
        job: '', 
        jobTitle: '',
        department: '',
        position: '',
        startDate: '', 
        startYear: '',
        startMonth: '',
        endDate: '',
        endYear: '',
        endMonth: '',
        current: false,
        isCurrent: false,
        isCompanyHidden: false
      }] 
    }));
  };
  
  const removeCareer = (idx) => {
    const newCareer = [...(form.career || [])];
    newCareer.splice(idx, 1);
    setForm((prev) => ({ ...prev, career: newCareer }));
  };
  
  return (
    <section className="resume-section">
      <h3>경력</h3>
      {(form.career || []).map((car, idx) => (
        <div className="career-card" key={idx}>
          <div className="career-form-row">
            <div className="career-field">
              <label>회사명</label>
              <div className="company-input-wrapper">
                <input 
                  type="text"
                  value={car.company} 
                  onChange={e => handleChange(idx, 'company', e.target.value)}
                  placeholder="회사명을 입력하세요"
                  className={car.isCompanyHidden ? 'hidden-company' : ''}
                />
                <button
                  type="button"
                  className="company-hide-toggle"
                  onClick={() => handleChange(idx, 'isCompanyHidden', !car.isCompanyHidden)}
                  title={car.isCompanyHidden ? '회사명 표시' : '회사명 숨김'}
                >
                  {car.isCompanyHidden ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            
            <div className="career-field">
              <label>직무</label>
              <input 
                type="text"
                value={car.jobTitle} 
                onChange={e => handleChange(idx, 'jobTitle', e.target.value)}
                placeholder="직무를 입력하세요"
              />
            </div>
            <div className="career-field">
              <label>부서</label>
              <input 
                type="text"
                value={car.department}
                onChange={e => handleChange(idx, 'department', e.target.value)}
                placeholder="부서를 입력하세요"
              />
            </div>
            <div className="career-field">
              <label>직급</label>
              <input 
                type="text"
                value={car.position}
                onChange={e => handleChange(idx, 'position', e.target.value)}
                placeholder="직급을 입력하세요"
              />
            </div>
            
            <div className="career-field">
              <label>시작년월</label>
              <input 
                type="month"
                value={car.startYear && car.startMonth ? `${car.startYear}-${car.startMonth}` : ''}
                onChange={e => handleChange(idx, 'startDate', e.target.value)}
                placeholder="시작년월 선택"
              />
            </div>
            <div className="career-field">
              <label>종료년월</label>
              <input 
                type="month"
                value={car.endYear && car.endMonth ? `${car.endYear}-${car.endMonth}` : ''}
                onChange={e => handleChange(idx, 'endDate', e.target.value)}
                placeholder="종료년월 선택"
                disabled={car.current}
                className={car.current ? 'current-job' : ''}
              />
            </div>
            
            <div className="career-field">
              <label className="career-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={car.current} 
                  onChange={e => handleChange(idx, 'current', e.target.checked)}
                />
                <span className="career-checkbox-text">재직중</span>
              </label>
            </div>
            
            <button 
              type="button" 
              className="remove-career-btn" 
              onClick={() => removeCareer(idx)}
            >
              <FaTrash />
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="add-career-btn" onClick={addCareer}>
        <FaPlus /> 경력 추가
      </button>
    </section>
  );
};

export default ResumeCareerSection; 